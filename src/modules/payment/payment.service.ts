import { BadRequestException, Injectable } from '@nestjs/common';
import { CompletePurchaseDto, PurchaseDto } from './payment.dto';
import { ITransaction, ITransactionDocument } from './payment.interface';
import { PaymentStatus, vnpayEndpoint } from './payment.enum';
import { VnpayService } from '../../externalModules/vnpay/vnpay.service';
import { TransactionRepository } from './payment.repository';
import { db2api } from '../../shared/helpers';
import {
  getSignature,
  sortObject,
} from '../../externalModules/vnpay/vnpay.helper';
import {
  ResponseCode,
  SignatureType,
} from '../../externalModules/vnpay/vnpay.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionRepository: TransactionRepository,
  ) {}
  async purchase(
    createPurchaseDto: PurchaseDto,
    userId: string,
  ): Promise<{ transaction: ITransaction; paymentGatewayUrl: string }> {
    const findExitsTransaction = await this.transactionRepository.findOne({
      referenceId: createPurchaseDto.referenceId,
    });
    if (findExitsTransaction) {
      throw new BadRequestException('ReferenceId was used');
    }
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
      transaction: { ...response },
      paymentGatewayUrl: `${vnpayEndpoint}?${paymentGatewayRequest.toQueryString()}`,
    };
  }

  async completePurchase(completePurchaseDto: CompletePurchaseDto) {
    const vnpayResponse = await this.parseResponse(completePurchaseDto);
    const payload: Partial<ITransaction> = { ...vnpayResponse };
    const transaction = await this.transactionRepository.findOne(
      { referenceId: vnpayResponse.txnRef },
      { sort: { createdAt: -1 } },
    );
    if (!transaction) {
      throw new BadRequestException('Transaction with referenceId not exits');
    }
    return this.transactionRepository.updateById(transaction.id, {
      ...payload,
    });
  }

  async parseResponse(completePurchaseDto: CompletePurchaseDto) {
    const webhookResponse = JSON.stringify({ ...completePurchaseDto });
    if (this.checkInvalidSignature(completePurchaseDto)) {
      throw new BadRequestException('Invalid signature');
    }
    return {
      webhookResponse,
      txnRef: completePurchaseDto.vnp_TxnRef,
      bankCode: completePurchaseDto.vnp_BankCode,
      cardType: completePurchaseDto.vnp_CardType,
      bankTranNo: completePurchaseDto.vnp_BankTranNo,
      vnpayTranNo: completePurchaseDto.vnp_TransactionNo,
      status:
        completePurchaseDto.vnp_ResponseCode === ResponseCode.SUCCESS
          ? PaymentStatus.SUCCEEDED
          : PaymentStatus.FAILED,
    };
  }
  private checkInvalidSignature(completePurchaseDto: CompletePurchaseDto) {
    const signatureInput = completePurchaseDto.vnp_SecureHash;
    delete completePurchaseDto.vnp_SecureHash;
    delete completePurchaseDto.vnp_SecureHashType;
    const signature = getSignature(
      sortObject({ ...completePurchaseDto }),
      SignatureType.SHA512,
    );
    return signatureInput !== signature;
  }
}
