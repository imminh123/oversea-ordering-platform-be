import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
import { IAddressDocument } from './address.interface';

export class AddressRepository
  extends BaseRepository<IAddressDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Address) model: Model<IAddressDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
