import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createMongooseOptions } from '../../shared/helpers';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => createMongooseOptions('mongodb.uri'),
    }),
  ],
})
export class DatabaseModule {}
