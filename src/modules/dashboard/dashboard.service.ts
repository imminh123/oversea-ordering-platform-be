import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../order/order.repository';
import { CartRepository } from '../cart/cart.repository';
import { OrderStatus } from '../order/order.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
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
    return {
      lenCart: await this.cartRepository.count({}),
      lenOrder: await this.orderRepository.count({}),
      countCreated: await this.orderRepository.count({
        status: OrderStatus.CREATED,
      }),
      countPendingPayment: await this.orderRepository.count({
        status: OrderStatus.PENDING_PAYMENT,
      }),
      countDelivered: await this.orderRepository.count({
        status: OrderStatus.DELIVERED,
      }),
      countPendingOrder: await this.orderRepository.count({
        status: OrderStatus.PENDING_ORDER,
      }),
    };
  }
}
