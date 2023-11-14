import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { IAuthDocument } from './authentication.interface';
import { BaseRepository } from '../database/base-repository';

export class AuthenticationRepository
  extends BaseRepository<IAuthDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Auth) model: Model<IAuthDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
