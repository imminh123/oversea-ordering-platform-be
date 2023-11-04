import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { IAuth } from './authentication.interface';
import { BaseRepository } from '../database/base-repository';

export class AuthenticationRepository
  extends BaseRepository<IAuth>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Auth) model: Model<IAuth>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
