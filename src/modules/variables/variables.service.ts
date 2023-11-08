import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AddVariableDto,
  AdminIndexVariableDto,
  UpdateVariableDto,
} from './variables.dto';
import { VariableRepository } from './variables.repository';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { db2api } from '../../shared/helpers';
import { IVariable, IVariableDocument } from './variables.interface';
import { isValidObjectId } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class VariablesService {
  constructor(
    private readonly variableRepository: VariableRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async createNewVariable({ name, value }: AddVariableDto) {
    const variable = await this.variableRepository.findOne({ name });
    if (variable) {
      throw new BadRequestException('Variable with this name exits');
    }
    return this.variableRepository.create({ name, value });
  }

  async indexVariable(
    { name }: AdminIndexVariableDto,
    pagination: IPagination,
  ) {
    const findParam: any = {};
    if (name) {
      findParam.name = name;
    }
    const listVariable = await this.variableRepository.find(findParam);
    const listLength = await this.variableRepository.count(findParam);
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<IVariableDocument[], IVariable[]>(listVariable),
      headers: responseHeader,
    };
  }

  async getVariableById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id must be objectId');
    }
    const variable = await this.variableRepository.findById(id);
    if (!variable) {
      throw new BadRequestException('Not found variable with given id');
    }
    return db2api<IVariableDocument, IVariable>(variable);
  }

  async updateVariableById(id: string, { value }: UpdateVariableDto) {
    await this.getVariableById(id);
    await this.cacheManager.reset();
    return this.variableRepository.updateById(id, { value });
  }

  async deleteVariableById(id: string) {
    await this.getVariableById(id);
    return this.variableRepository.deleteById(id);
  }

  async getVariable(name: string): Promise<string | undefined> {
    const value: string = await this.cacheManager.get(name);
    if (value) {
      return value;
    }
    const variable = await this.variableRepository.findOne({ name });
    if (!variable) {
      return null;
    }
    await this.cacheManager.set(name, variable.value);
    return variable.value;
  }
}
