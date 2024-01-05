import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../order/order.repository';
import { CartRepository } from '../cart/cart.repository';
import { OrderStatus } from '../order/order.enum';
import { TransactionRepository } from '../payment/payment.repository';
import { StartOfDay, StartOfMonth } from '../../shared/helpers';
import { PaymentStatus } from '../payment/payment.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async getDashboardInformation(userId: string) {
    return {
      lenCart: await this.cartRepository.count({ userId }),
      lenOrder: await this.orderRepository.count({ userId }),
      countCreated: await this.orderRepository.count({
        userId,
        status: OrderStatus.CREATED,
      }),
      countPendingPayment: await this.orderRepository.count({
        userId,
        status: OrderStatus.PENDING_PAYMENT,
      }),
      countDelivered: await this.orderRepository.count({
        userId,
        status: OrderStatus.DELIVERED,
      }),
      countPendingOrder: await this.orderRepository.count({
        userId,
        status: OrderStatus.PENDING_ORDER,
      }),
    };
  }

  async getAdminDashboardInformation() {
    const current = new Date();
    const startOfDay = StartOfDay(current);
    const startOfMonth = StartOfMonth(current);
    return {
      countOrderFromBeginOfDay: await this.orderRepository.count({
        createdAt: { $gte: startOfDay },
        status: {
          $nin: [
            OrderStatus.FAILED,
            OrderStatus.TIMEOUT,
            OrderStatus.CANCELLED,
          ],
        },
      }),
      countOrderFromBeginOfMonth: await this.orderRepository.count({
        createdAt: { $gte: startOfMonth },
        status: {
          $nin: [
            OrderStatus.FAILED,
            OrderStatus.TIMEOUT,
            OrderStatus.CANCELLED,
          ],
        },
      }),
      totalMoneyEarnedFromBeginOfDay:
        [
          ...(await this.transactionRepository.getSumOfAmount({
            createdAt: { $gte: startOfDay },
            status: PaymentStatus.SUCCEEDED,
          })),
        ][0]?.sum || 0,
      totalMoneyEarnedFromBeginOfMonth:
        [
          ...(await this.transactionRepository.getSumOfAmount({
            createdAt: { $gte: startOfMonth },
            status: PaymentStatus.SUCCEEDED,
          })),
        ][0]?.sum || 0,
    };
  }
}
