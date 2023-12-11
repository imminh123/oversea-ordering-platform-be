import { Module } from '@nestjs/common';
import { TaobaoService } from './taobao.service';
import { ApiTaobaoService } from './apiTaobao.service';
import { TaobaoController } from './taobao.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { ICacheItemSchema } from './taobao.schema';
import { CacheItemRepository } from './taobao.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.CacheItem, schema: ICacheItemSchema },
    ]),
  ],
  providers: [TaobaoService, ApiTaobaoService, CacheItemRepository],
  exports: [TaobaoService],
  controllers: [TaobaoController],
})
export class TaobaoModule {}
