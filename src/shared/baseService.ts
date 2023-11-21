import { Document, isValidObjectId } from 'mongoose';
import { BaseRepository } from './database/base-repository';
import { db2api } from './helpers';
import { BadRequestException } from '@nestjs/common';

export class BaseService<T extends Document, U> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async createDocument(dto: any, userId: string): Promise<U> {
    const document = await this.repository.create({ ...dto, userId });
    return db2api<T, U>(document);
  }

  async indexDocuments(userId?: string): Promise<U[]> {
    const findParams: any = {};
    if (userId) {
      findParams.userId = userId;
    }

    const listDocuments = await this.repository.find(findParams, {
      sort: { createdAt: -1 },
    });

    return db2api<T[], U[]>(listDocuments);
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
