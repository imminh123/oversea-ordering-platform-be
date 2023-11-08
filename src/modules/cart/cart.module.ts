import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { DbModel } from '../../shared/constant';
import { MongooseModule } from '@nestjs/mongoose';
import { ICartSchema } from './cart.schema';
import { TaobaoModule } from '../../externalModules/taobao/taobao.module';
import { VariablesModule } from '../variables/variables.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DbModel.Cart, schema: ICartSchema }]),
    TaobaoModule,
    VariablesModule,
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
