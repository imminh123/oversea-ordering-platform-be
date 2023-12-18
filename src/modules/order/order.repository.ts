import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
import { IOrderDocument } from './order.interface';

export class OrderRepository
  extends BaseRepository<IOrderDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Order) model: Model<IOrderDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
