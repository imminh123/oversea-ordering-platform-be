import { Module } from '@nestjs/common';
import { TaobaoService } from './taobao.service';

@Module({
  providers: [TaobaoService],
  exports: [TaobaoService],
})
export class TaobaoModule {}
