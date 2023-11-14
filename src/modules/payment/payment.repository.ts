import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../database/base-repository';
import { ITransactionDocument } from './payment.interface';

export class TransactionRepository
  extends BaseRepository<ITransactionDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(DbModel.Transactions) model: Model<ITransactionDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
