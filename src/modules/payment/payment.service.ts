import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import {
  AdminIndexPaymentDto,
  CompletePurchaseDto,
  PurchaseDto,
} from './payment.dto';
import { ITransaction, ITransactionDocument } from './payment.interface';
import {
  PaymentStatus,
  orderTimeOutInMinutes,
  vnpayEndpoint,
} from './payment.enum';
import { VnpayService } from '../../externalModules/vnpay/vnpay.service';
import { TransactionRepository } from './payment.repository';
import {
  buildFilterDateParam,
  createTimeStringWithFormat,
  db2api,
  isAfter,
} from '../../shared/helpers';
import {
  getSignature,
  sortObject,
} from '../../externalModules/vnpay/vnpay.helper';
import {
  ResponseCode,
  SignatureType,
} from '../../externalModules/vnpay/vnpay.enum';
import { OrderService } from '../order/order.service';
import { OrderStatus, UpdatedByUser } from '../order/order.enum';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { CartService } from '../cart/cart.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { MailService } from '../mail/mail.service';
import { Readable } from 'stream';
import { stringify } from 'csv-stringify';

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
    userName?: string,
  ): Promise<{ transaction: ITransaction; paymentGatewayUrl: string }> {
    if (!userName) {
      const user = await this.authenticationService.getUserById(userId);
      userName = user.fullname;
    }
    const { order, findExitsTransaction } =
      await this.verifyOrderBeforePurchase(createPurchaseDto.referenceId);
    let transaction;
    if (
      !findExitsTransaction ||
      findExitsTransaction.status === PaymentStatus.FAILED
    ) {
      const transactionPayload = {
        userId,
        userName,
        referenceId: createPurchaseDto.referenceId,
        amount: order.total,
        orderInfo: `Tra tien cho don dat hang ${order.id}`,
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
        orderInfo: `Tra tien cho don dat hang ${order.id}`,
      });
    if (order.status === OrderStatus.CREATED) {
      await this.orderService.updateOrderStatus(createPurchaseDto.referenceId, {
        status: OrderStatus.PENDING_PAYMENT,
        updatedBy: userId,
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
          ? OrderStatus.PENDING_ORDER
          : OrderStatus.FAILED;
      const order = await this.orderService.getOrderById(
        transaction.referenceId,
      );
      if (
        order.status !== OrderStatus.PENDING_PAYMENT &&
        order.status !== OrderStatus.TIMEOUT
      ) {
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
          console.log(`cannot send mail to ${user.mail}`, error);
        }
      }
      await Promise.all([
        this.transactionRepository.updateById(transaction.id, {
          ...payload,
        }),
        this.orderService.updateOrderStatus(
          transaction.referenceId,
          {
            status: incomingStatus,
          },
          true,
        ),
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

  async clientIndexPaymentTransactions(
    userId: string,
    pagination: IPagination,
  ) {
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

  async adminIndexPaymentTransactions(
    indexOrderDto: AdminIndexPaymentDto,
    pagination: IPagination,
  ) {
    const findParam: any = {};
    if (indexOrderDto.userId) {
      findParam.userId = indexOrderDto.userId;
    }
    if (indexOrderDto.status) {
      findParam.status = indexOrderDto.status;
    }
    if (indexOrderDto.timeFrom) {
      findParam.createdAt = buildFilterDateParam(
        indexOrderDto.timeFrom,
        indexOrderDto.timeTo,
      );
    }
    if (indexOrderDto.userName) {
      findParam.userName = {
        $regex: new RegExp(indexOrderDto.userName, 'i'),
      };
    }
    const transactions = await this.transactionRepository.find(findParam, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { createdAt: -1 },
    });

    const listLength = await this.transactionRepository.count(findParam);
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<ITransactionDocument[], ITransaction[]>(transactions),
      headers: responseHeader,
    };
  }

  async downloadListOrders(indexOrderDto: AdminIndexPaymentDto) {
    const findParam: any = {};
    if (indexOrderDto.userId) {
      findParam.userId = indexOrderDto.userId;
    }
    if (indexOrderDto.status) {
      findParam.status = indexOrderDto.status;
    }
    if (indexOrderDto.timeFrom) {
      findParam.createdAt = buildFilterDateParam(
        indexOrderDto.timeFrom,
        indexOrderDto.timeTo,
      );
    }
    if (indexOrderDto.userName) {
      findParam.userName = {
        $regex: new RegExp(indexOrderDto.userName, 'i'),
      };
    }

    const orders = await this.transactionRepository.find(findParam, {
      sort: { createdAt: -1 },
      batchSize: 100000,
    });

    const csvStream = stringify({
      columns: [
        'userName',
        'status',
        'orderInfo',
        'amount',
        'vnpayTranNo',
        'createdAt',
      ],
    });
    csvStream.on('error', (err) => console.log(JSON.stringify(err)));
    csvStream.write([
      'Tên khách hàng',
      'Trạng thái',
      'Thông tin thanh toán',
      'Tổng tiền',
      'Mã tra cứu VN Pay',
      'Thời gian thanh toán',
    ]);

    for await (const {
      userName,
      status,
      orderInfo,
      amount,
      createdAt,
      vnpayTranNo,
    } of orders) {
      csvStream.write({
        userName,
        status,
        orderInfo,
        amount,
        vnpayTranNo,
        createdAt: createTimeStringWithFormat(createdAt, 'mm:ss DD-MM-YYYY'),
      });
    }
    csvStream.end();
    return Readable.from(csvStream);
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
    if (!isAfter(order.createdAt, new Date(), orderTimeOutInMinutes)) {
      await this.orderService.updateOrderStatus(orderId, {
        status: OrderStatus.TIMEOUT,
        updatedBy: UpdatedByUser.SYSTEM,
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
