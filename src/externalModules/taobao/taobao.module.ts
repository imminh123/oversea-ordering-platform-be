import { Module } from '@nestjs/common';
import { TaobaoService } from './taobao.service';
import { ApiTaobaoService } from './apiTaobao.service';

@Module({
  providers: [TaobaoService, ApiTaobaoService],
  exports: [TaobaoService],
})
export class TaobaoModule {}
