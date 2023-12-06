import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { CompletePurchaseDto, PurchaseDto } from './payment.dto';
import { ITransaction, ITransactionDocument } from './payment.interface';
import { PaymentStatus, vnpayEndpoint } from './payment.enum';
import { VnpayService } from '../../externalModules/vnpay/vnpay.service';
import { TransactionRepository } from './payment.repository';
import { db2api, isAfter } from '../../shared/helpers';
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
import { AuthenticationService } from '../authentication/authentication.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionRepository: TransactionRepository,
    private readonly authenticationService: AuthenticationService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {}
  async purchase(
    createPurchaseDto: PurchaseDto,
    userId: string,
  ): Promise<{ transaction: ITransaction; paymentGatewayUrl: string }> {
    const { order, findExitsTransaction } =
      await this.verifyOrderBeforePurchase(createPurchaseDto.referenceId);
    let transaction;
    if (
      !findExitsTransaction ||
      findExitsTransaction.status === PaymentStatus.FAILED
    ) {
      const transactionPayload = {
        userId,
        referenceId: createPurchaseDto.referenceId,
        amount: order.total,
        orderInfo: `Pay for order ${order.id}`,
        status: PaymentStatus.PENDING,
      } as ITransaction;
      transaction = await this.transactionRepository.create(transactionPayload);
    } else {
      transaction = findExitsTransaction;
    }

    const paymentGatewayRequest =
      await this.vnpayService.getVnpayPaymentGatewayRequest({
        ...createPurchaseDto,
        amount: order.total,
        orderInfo: `Pay for order ${order.id}`,
      });
    if (order.status === OrderStatus.CREATED) {
      await this.orderService.updateOrderStatus(createPurchaseDto.referenceId, {
        status: OrderStatus.PENDING_PAYMENT,
      });
    }
    const response = db2api<ITransactionDocument, ITransaction>(transaction);
    return {
      transaction: { ...response },
      paymentGatewayUrl: `${vnpayEndpoint}?${paymentGatewayRequest.toQueryString()}`,
    };
  }

  async completePurchase(completePurchaseDto: CompletePurchaseDto) {
    try {
      const vnpayResponse = await this.parseResponse(completePurchaseDto);
      const payload: Partial<ITransaction> = { ...vnpayResponse };
      const transaction = await this.transactionRepository.findOne(
        { referenceId: vnpayResponse.txnRef },
        { sort: { createdAt: -1 } },
      );
      if (!transaction) {
        throw new HttpException(
          { RspCode: '01', Message: 'Order not found' },
          200,
        );
      }
      if (transaction.status === payload.status) {
        throw new HttpException(
          {
            RspCode: '02',
            Message: 'This transaction has been updated to the payment status',
          },
          200,
        );
      }
      const incomingStatus =
        payload.status === PaymentStatus.SUCCEEDED
          ? OrderStatus.DELIVERED
          : OrderStatus.FAILED;
      const order = await this.orderService.getOrderById(
        transaction.referenceId,
      );
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new HttpException(
          {
            RspCode: '02',
            Message: 'This order has been updated to the payment status',
          },
          200,
        );
      }
      const ids = [];
      if (vnpayResponse.status === PaymentStatus.SUCCEEDED) {
        for (const item of order.listItem) {
          ids.push(item.cartId);
        }
        const user = await this.authenticationService.getUserById(order.userId);
        const payload = {
          bankCode: vnpayResponse.bankCode,
          cardType: vnpayResponse.cardType,
          status: vnpayResponse.status,
          bankTranNo: vnpayResponse.bankTranNo,
          orderId: transaction.referenceId,
          amount: order.total,
          address: order.address,
          date: order.updatedAt,
          name: user.fullname,
        };
        try {
          this.mailService.sendPurchaseSuccess(payload, user.mail);
        } catch (error) {
          Logger.log(`cannot send mail to ${user.mail}`, error);
        }
      }
      await Promise.all([
        this.transactionRepository.updateById(transaction.id, {
          ...payload,
        }),
        this.orderService.updateOrderStatus(transaction.referenceId, {
          status: incomingStatus,
        }),
        this.cartService.delete(ids),
      ]);
      return { RspCode: '00', Message: 'success' };
    } catch (error) {
      throw error;
    }
  }

  async parseResponse(completePurchaseDto: CompletePurchaseDto) {
    const webhookResponse = JSON.stringify({ ...completePurchaseDto });
    if (this.checkInvalidSignature(completePurchaseDto)) {
      throw new HttpException(
        { RspCode: '97', Message: 'Checksum failed' },
        200,
      );
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
  private async verifyOrderBeforePurchase(orderId: string) {
    const order = await this.orderService.getOrderById(orderId);
    const findExitsTransaction = await this.transactionRepository.findOne({
      referenceId: orderId,
    });
    if (
      ![OrderStatus.CREATED, OrderStatus.PENDING_PAYMENT].includes(order.status)
    ) {
      throw new BadRequestException('Không thể thanh toán cho order này');
    }
    if (!isAfter(order.createdAt, new Date(), 5)) {
      await this.orderService.updateOrderStatus(orderId, {
        status: OrderStatus.TIMEOUT,
      });
      if (findExitsTransaction) {
        findExitsTransaction.status = PaymentStatus.FAILED;
        findExitsTransaction.save();
      }
      throw new BadRequestException('Order đã hết hạn thanh toán');
    }
    return { order, findExitsTransaction };
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
