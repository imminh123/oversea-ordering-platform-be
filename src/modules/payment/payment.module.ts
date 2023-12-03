import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { ITransactionSchema } from './payment.schema';
import { VnpayModule } from '../../externalModules/vnpay/vnpay.module';
import { TransactionRepository } from './payment.repository';
import { OrderModule } from '../order/order.module';
import { CartModule } from '../cart/cart.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.Transactions, schema: ITransactionSchema },
    ]),
    VnpayModule,
    AuthenticationModule,
    MailModule,
    forwardRef(() => OrderModule),
    forwardRef(() => CartModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, TransactionRepository],
  exports: [PaymentService],
})
export class PaymentModule {}
