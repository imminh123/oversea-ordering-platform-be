import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IVariableSchema } from './variables.schema';
import { VariableRepository } from './variables.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.Variables, schema: IVariableSchema },
    ]),
    CacheModule.register({ ttl: 30000 }),
  ],
  controllers: [VariablesController],
  providers: [VariablesService, VariableRepository],
  exports: [VariablesService],
})
export class VariablesModule {}
