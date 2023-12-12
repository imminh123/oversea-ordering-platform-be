import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { IClientAuthDocument } from './authentication.interface';
import { BaseRepository } from '../../shared/database/base-repository';

export class AuthenticationRepository
  extends BaseRepository<IClientAuthDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Auth) model: Model<IClientAuthDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
