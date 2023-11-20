import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
import { IVariableDocument } from './variables.interface';

export class VariableRepository
  extends BaseRepository<IVariableDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Variables) model: Model<IVariableDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
