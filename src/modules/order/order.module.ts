import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IOrderSchema } from './order.schema';
import { OrderRepository } from './order.repository';
import { TaobaoModule } from '../../externalModules/taobao/taobao.module';
import { VariablesModule } from '../variables/variables.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DbModel.Order, schema: IOrderSchema }]),
    TaobaoModule,
    VariablesModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
