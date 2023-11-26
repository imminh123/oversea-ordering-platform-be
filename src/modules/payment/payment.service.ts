import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
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
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/order.enum';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { CartService } from '../cart/cart.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionRepository: TransactionRepository,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {}
  async purchase(
    createPurchaseDto: PurchaseDto,
    userId: string,
  ): Promise<{ transaction: ITransaction; paymentGatewayUrl: string }> {
    const findExitsTransaction = await this.transactionRepository.findOne({
      referenceId: createPurchaseDto.referenceId,
    });
    const order = await this.orderService.getOrderById(
      createPurchaseDto.referenceId,
    );
    if (findExitsTransaction && order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('ReferenceId was used');
    }
    let transaction;
    if (!findExitsTransaction) {
      const transactionPayload = {
        userId,
        referenceId: createPurchaseDto.referenceId,
        amount: createPurchaseDto.amount,
        orderInfo: createPurchaseDto.orderInfo,
        status: PaymentStatus.PENDING,
      } as ITransaction;
      transaction = await this.transactionRepository.create(transactionPayload);
      await this.orderService.updateOrderStatus(createPurchaseDto.referenceId, {
        status: OrderStatus.PENDING_PAYMENT,
      });
    } else {
      transaction = findExitsTransaction;
    }
    const paymentGatewayRequest =
      await this.vnpayService.getVnpayPaymentGatewayRequest({
        ...createPurchaseDto,
        transactionId: transaction.id,
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
    const incomingStatus =
      payload.status === PaymentStatus.SUCCEEDED
        ? OrderStatus.DELIVERED
        : OrderStatus.PENDING_PAYMENT;
    const order = await this.orderService.getOrderById(transaction.referenceId);
    const ids = [];
    if (payload.status === PaymentStatus.SUCCEEDED) {
      for (const item of order.listItem) {
        ids.push(item.cartId);
      }
    }
    return Promise.all([
      this.transactionRepository.updateById(transaction.id, {
        ...payload,
      }),
      this.orderService.updateOrderStatus(transaction.referenceId, {
        status: incomingStatus,
      }),
      this.cartService.delete(ids),
    ]);
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

  async indexPaymentTransactions(userId: string, pagination: IPagination) {
    const transactions = await this.transactionRepository.find(
      { userId },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { createdAt: -1 },
      },
    );

    const listLength = await this.transactionRepository.count({ userId });
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<ITransactionDocument[], ITransaction[]>(transactions),
      headers: responseHeader,
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
