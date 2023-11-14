import { Injectable } from '@nestjs/common';
import { PurchaseDto } from './payment.dto';
import { ITransaction, ITransactionDocument } from './payment.interface';
import { PaymentStatus, vnpayEndpoint } from './payment.enum';
import { VnpayService } from '../../externalModules/vnpay/vnpay.service';
import { TransactionRepository } from './payment.repository';
import { db2api } from '../../shared/helpers';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionRepository: TransactionRepository,
  ) {}
  async purchase(createPurchaseDto: PurchaseDto, userId: string) {
    const transactionPayload = {
      userId,
      referenceId: createPurchaseDto.referenceId,
      amount: createPurchaseDto.amount,
      orderInfo: createPurchaseDto.orderInfo,
      status: PaymentStatus.PENDING,
    } as ITransaction;
    const transaction = await this.transactionRepository.create(
      transactionPayload,
    );
    const paymentGatewayRequest =
      await this.vnpayService.getVnpayPaymentGatewayRequest({
        ...createPurchaseDto,
      });
    const response = db2api<ITransactionDocument, ITransaction>(transaction);
    return {
      ...response,
      paymentGatewayUrl: `${vnpayEndpoint}?${paymentGatewayRequest.toQueryString()}`,
    };
  }
}
