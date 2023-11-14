import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { ITransactionSchema } from './payment.schema';
import { VnpayModule } from '../../externalModules/vnpay/vnpay.module';
import { TransactionRepository } from './payment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.Transactions, schema: ITransactionSchema },
    ]),
    VnpayModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, TransactionRepository],
})
export class PaymentModule {}
