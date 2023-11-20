import { Module } from '@nestjs/common';

import { configProvider } from './config.provider';

@Module({
  imports: [],
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
