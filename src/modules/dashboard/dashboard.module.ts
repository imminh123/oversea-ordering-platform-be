import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { DashboardController } from './dashboard.controller';
import { OrderModule } from '../order/order.module';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [OrderModule, CartModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
