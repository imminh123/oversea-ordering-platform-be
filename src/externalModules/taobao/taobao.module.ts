import { Module } from '@nestjs/common';
import { TaobaoService } from './taobao.service';
import { ApiTaobaoService } from './apiTaobao.service';
import { TaobaoController } from './taobao.controller';

@Module({
  providers: [TaobaoService, ApiTaobaoService],
  exports: [TaobaoService],
  controllers: [TaobaoController],
})
export class TaobaoModule {}
