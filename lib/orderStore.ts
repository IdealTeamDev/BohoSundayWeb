import type { BuyerInfo } from '@/types/checkout';
import { decreaseWordPressStock } from './tickets';

export interface OrderDetail {
  orderId: string;
  ticketId: string;
  sessionToken: string;
  buyerInfo: BuyerInfo;
  quantity: number;
  paymentMethod: 'mercadopago' | 'wompi';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  paymentId?: string;
  errorDetail?: string;
}

const globalForOrderStore = globalThis as unknown as {
  orderStore?: Map<string, OrderDetail>;
};

const orderStore = globalForOrderStore.orderStore ?? new Map<string, OrderDetail>();

if (process.env.NODE_ENV !== 'production') {
  globalForOrderStore.orderStore = orderStore;
}

/**
 * Creates and registers a new pending order
 */
export function createOrder(
  orderId: string,
  ticketId: string,
  sessionToken: string,
  buyerInfo: BuyerInfo,
  quantity: number,
  paymentMethod: 'mercadopago' | 'wompi'
): OrderDetail {
  const order: OrderDetail = {
    orderId,
    ticketId,
    sessionToken,
    buyerInfo,
    quantity,
    paymentMethod,
    status: 'pending',
    createdAt: Date.now(),
  };
  orderStore.set(orderId, order);
  console.log(`[OrderStore] 📝 Order created: ${orderId} (Ticket: ${ticketId}, Method: ${paymentMethod}, Status: pending)`);
  return order;
}

/**
 * Retrieves an order by its ID
 */
export function getOrder(orderId: string): OrderDetail | null {
  return orderStore.get(orderId) || null;
}

/**
 * Approves a pending order
 */
export function approveOrder(orderId: string, paymentId: string): OrderDetail | null {
  const order = orderStore.get(orderId);
  if (!order) {
    console.error(`[OrderStore] ❌ Error: Order ${orderId} not found to approve.`);
    return null;
  }
  
  if (order.status === 'approved') {
    console.log(`[OrderStore] ℹ️ Order ${orderId} is already approved.`);
    return order;
  }

  const updatedOrder: OrderDetail = {
    ...order,
    status: 'approved',
    paymentId,
  };
  
  orderStore.set(orderId, updatedOrder);
  console.log(`[OrderStore] ✅ Order ${orderId} approved with paymentId ${paymentId}`);

  // Decrease stock in WordPress asynchronously
  decreaseWordPressStock(order.ticketId, order.quantity).catch((err) => {
    console.error('[OrderStore] Error calling decreaseWordPressStock:', err);
  });

  return updatedOrder;
}

/**
 * Marks an order as rejected/failed
 */
export function rejectOrder(orderId: string, errorDetail?: string): OrderDetail | null {
  const order = orderStore.get(orderId);
  if (!order) {
    console.error(`[OrderStore] ❌ Error: Order ${orderId} not found to reject.`);
    return null;
  }

  const updatedOrder: OrderDetail = {
    ...order,
    status: 'rejected',
    errorDetail,
  };
  
  orderStore.set(orderId, updatedOrder);
  console.log(`[OrderStore] ❌ Order ${orderId} marked as rejected. Reason: ${errorDetail}`);
  return updatedOrder;
}
