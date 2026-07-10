import type { BuyerInfo } from '@/types/checkout';
import { decreaseWordPressStock } from './tickets';
import { sendAdminNotificationEmail } from './emailService';
import fs from 'fs';
import path from 'path';

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
  accessesUsed?: number;
}

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

// Read orders from filesystem JSON database
function readOrdersFromFile(): Map<string, OrderDetail> {
  const map = new Map<string, OrderDetail>();
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      const dir = path.dirname(ORDERS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
      return map;
    }
    const content = fs.readFileSync(ORDERS_FILE, 'utf8');
    const list = JSON.parse(content) as OrderDetail[];
    list.forEach(o => map.set(o.orderId, o));
  } catch (error) {
    console.error('[OrderStore] Error reading orders file, using memory backup:', error);
  }
  return map;
}

// Write orders to filesystem JSON database
function writeOrdersToFile(map: Map<string, OrderDetail>): void {
  try {
    const list = Array.from(map.values());
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (error) {
    console.error('[OrderStore] Error writing orders file:', error);
  }
}

const globalForOrderStore = globalThis as unknown as {
  orderStore?: Map<string, OrderDetail>;
};

// Initialize in-memory map from file
const orderStore = globalForOrderStore.orderStore ?? readOrdersFromFile();

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
    accessesUsed: 0,
  };
  
  orderStore.set(orderId, order);
  writeOrdersToFile(orderStore);
  
  console.log(`[OrderStore] 📝 Order created: ${orderId} (Ticket: ${ticketId}, Method: ${paymentMethod}, Status: pending)`);
  return order;
}

/**
 * Retrieves an order by its ID
 */
export function getOrder(orderId: string): OrderDetail | null {
  // Sync memory store with file to verify fresh status
  const freshMap = readOrdersFromFile();
  if (freshMap.has(orderId)) {
    // Keep in-memory cache synchronized
    orderStore.set(orderId, freshMap.get(orderId)!);
  }
  return orderStore.get(orderId) || null;
}

/**
 * Retrieves all orders from the store
 */
export function getAllOrders(): OrderDetail[] {
  const freshMap = readOrdersFromFile();
  return Array.from(freshMap.values());
}

/**
 * Approves a pending order
 */
export async function approveOrder(orderId: string, paymentId: string): Promise<OrderDetail | null> {
  const freshMap = readOrdersFromFile();
  const order = freshMap.get(orderId) || orderStore.get(orderId);
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
  writeOrdersToFile(orderStore);
  console.log(`[OrderStore] ✅ Order ${orderId} approved with paymentId ${paymentId}`);

  // Decrease stock in WordPress
  await decreaseWordPressStock(order.ticketId, order.quantity).catch((err) => {
    console.error('[OrderStore] Error calling decreaseWordPressStock:', err);
  });

  // Send success notification email to admin asynchronously
  sendAdminNotificationEmail(updatedOrder, 'approved').catch((err) => {
    console.error('[OrderStore] Error calling sendAdminNotificationEmail (approved):', err);
  });

  return updatedOrder;
}

/**
 * Marks an order as rejected/failed
 */
export function rejectOrder(orderId: string, errorDetail?: string): OrderDetail | null {
  const freshMap = readOrdersFromFile();
  const order = freshMap.get(orderId) || orderStore.get(orderId);
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
  writeOrdersToFile(orderStore);
  console.log(`[OrderStore] ❌ Order ${orderId} marked as rejected. Reason: ${errorDetail}`);

  // Send failed notification email to admin asynchronously
  if (order.status !== 'rejected' && order.status !== 'approved') {
    sendAdminNotificationEmail(updatedOrder, 'rejected').catch((err) => {
      console.error('[OrderStore] Error calling sendAdminNotificationEmail (rejected):', err);
    });
  }

  return updatedOrder;
}

/**
 * Records accesses check-in for an order
 */
export function updateOrderAccesses(orderId: string, count: number, totalCapacity: number): { success: boolean; error?: string; remaining?: number } {
  const freshMap = readOrdersFromFile();
  const order = freshMap.get(orderId) || orderStore.get(orderId);
  
  if (!order) {
    return { success: false, error: 'Orden no encontrada' };
  }

  if (order.status !== 'approved') {
    return { success: false, error: 'La orden no está en estado aprobado/pagado' };
  }

  const currentUsed = order.accessesUsed || 0;
  const newUsed = currentUsed + count;

  if (newUsed > totalCapacity) {
    return { 
      success: false, 
      error: `Límite de accesos excedido. Capacidad: ${totalCapacity}, Usados: ${currentUsed}, Solicitados: ${count}`,
      remaining: Math.max(0, totalCapacity - currentUsed)
    };
  }

  const updatedOrder: OrderDetail = {
    ...order,
    accessesUsed: newUsed
  };

  orderStore.set(orderId, updatedOrder);
  writeOrdersToFile(orderStore);

  console.log(`[OrderStore] 🎟️ Access validation: order ${orderId} used ${count} more access(es). Total used: ${newUsed}/${totalCapacity}`);
  
  return { 
    success: true, 
    remaining: totalCapacity - newUsed 
  };
}
