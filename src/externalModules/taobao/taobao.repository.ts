import { OnApplicationBootstrap } from '@nestjs/common';
import { BaseRepository } from '../../shared/database/base-repository';
import { ICacheItemDocument } from './taobao.interface';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';

export class CacheItemRepository
  extends BaseRepository<ICacheItemDocument>
  implements OnApplicationBootstrap
{
  constructor(
    @InjectModel(DbModel.CacheItem) model: Model<ICacheItemDocument>,
  ) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
