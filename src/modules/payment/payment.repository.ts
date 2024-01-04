import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
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

  async getSumOfAmount(findParam: any) {
    return this.model
      .aggregate([
        {
          $match: findParam,
        },
        {
          $group: {
            _id: null,
            sum: {
              $sum: '$amount',
            },
          },
        },
      ])
      .exec();
  }
}
