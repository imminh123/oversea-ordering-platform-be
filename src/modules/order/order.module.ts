import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IOrderSchema } from './order.schema';
import { OrderRepository } from './order.repository';
import { TaobaoModule } from '../../externalModules/taobao/taobao.module';
import { VariablesModule } from '../variables/variables.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DbModel.Order, schema: IOrderSchema }]),
    TaobaoModule,
    VariablesModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
