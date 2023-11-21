import { Document, isValidObjectId } from 'mongoose';
import { BaseRepository } from './database/base-repository';
import {
  IPagination,
  IPaginationHeader,
} from '../adapters/pagination/pagination.interface';
import { getHeaders } from '../adapters/pagination/pagination.helper';
import { db2api } from './helpers';
import { BadRequestException } from '@nestjs/common';

export class BaseService<T extends Document, U> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async createDocument(dto: any, userId: string): Promise<U> {
    const document = await this.repository.create({ ...dto, userId });
    return db2api<T, U>(document);
  }

  async indexDocuments(
    dto: any,
    pagination: IPagination,
    userId?: string,
  ): Promise<{ items: U[]; headers: IPaginationHeader }> {
    const findParams: any = {};
    if (userId) {
      findParams.userId = userId;
    }
    for (const [key, value] of Object.entries(dto)) {
      if (!Object.keys(pagination).includes(key) && value) {
        findParams[key] = value;
      }
    }
    const listDocuments = await this.repository.find(findParams, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { createdAt: -1 },
    });
    const listLength = await this.repository.count(findParams);
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<T[], U[]>(listDocuments),
      headers: responseHeader,
    };
  }

  async getDocumentById(id: string): Promise<U> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id must be objectId');
    }
    const document = await this.repository.findById(id);
    if (!document) {
      throw new BadRequestException('Not found document with given id');
    }
    return db2api<T, U>(document);
  }

  async updateDocumentById(id: string, dto: any): Promise<U> {
    await this.getDocumentById(id);
    const payload: any = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value) {
        payload[key] = value;
      }
    }
    const document = await this.repository.updateById(id, payload);
    return db2api<T, U>(document);
  }

  async removeDocumentById(id: string) {
    await this.getDocumentById(id);
    return this.repository.deleteById(id);
  }
}
