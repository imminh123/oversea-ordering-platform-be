import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
import { ICartDocument } from './cart.interface';

export class CartRepository
  extends BaseRepository<ICartDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Cart) model: Model<ICartDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
