import { Module } from '@nestjs/common';
import { NovuApiService } from './novu.api.service';
import { NovuService } from './novu.service';
import { NovuController } from './novu.controller';

@Module({
  controllers: [NovuController],
  providers: [NovuApiService, NovuService],
  exports: [NovuService],
})
export class NovuModule {}
