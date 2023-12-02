export const mockItem = {
  id: '682042505030',
  pvid: ['1627207:19761432'],
  volume: 1,
};

export enum OrderStatus {
  CREATED = 'created',
  PENDING_PAYMENT = 'pending_payment',
  PENDING_ORDER = 'pending_order',
  PROCESSING = 'processing',
  PLACED = 'placed',
  IN_TRANSIT = 'in_transit',
  OUT_OF_DELIVERY = 'out_of_delivery',
  DELIVERED = 'delivered',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_SHIPPED = 'partially_shipped',
  BACK_ORDERED = 'back_ordered',
  SUCCEEDED = 'succeeded',
  TIMEOUT = 'timeout',
  FAILED = 'failed',
}

export enum UpdatedByUser {
  VNPAY = 'VNPAY',
  SYSTEM = 'SYSTEM',
}
