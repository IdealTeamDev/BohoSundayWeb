import { NextRequest, NextResponse } from 'next/server';
import { getOrder, approveOrder, rejectOrder, createOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets, getActiveStage } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, wompiTxId, ticketId, buyerInfo, quantity } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    let order = getOrder(orderId);

    // If order is not found in memory (due to stateless serverless reset), recreate it using the details passed from sessionStorage
    if (!order && buyerInfo && ticketId && quantity) {
      console.log(`[OrderStore] 🔄 Recreating missing order ${orderId} in memory for verification.`);
      const activeStage = await getActiveStage();
      order = createOrder(orderId, ticketId, '', buyerInfo, Number(quantity), 'wompi', activeStage?.id);
      
      // If it is a quick sale, approve it immediately
      if (orderId.startsWith('ORD-QUICK-')) {
        console.log(`[OrderStore] ⚡ Recreated order is a quick sale. Approving immediately.`);
        order.status = 'approved';
        order.paymentId = 'manual-sale';
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Direct synchronous check with Wompi API if transaction ID is passed and order is pending
    if (order.status === 'pending' && order.paymentMethod === 'wompi' && wompiTxId) {
      console.log(`[Wompi API Polling] 🔍 Direct verification triggered for Order ${orderId} (Tx: ${wompiTxId})`);
      
      const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '';
      const isProduction = wompiPublicKey.startsWith('pub_prod_');
      const baseUrl = isProduction ? 'https://production.wompi.co' : 'https://sandbox.wompi.co';
      
      try {
        const response = await fetch(`${baseUrl}/v1/transactions/${wompiTxId}`);
        if (response.ok) {
          const data = await response.json();
          const transaction = data.data;

          if (transaction && transaction.reference === orderId) {
            const transactionStatus = transaction.status;

            if (transactionStatus === 'APPROVED') {
              // Approve order
              const updated = await approveOrder(orderId, wompiTxId);
              if (updated) order = updated;

              const tickets = await getDynamicTickets();

              // Confirm seat lock
              await markAsSold(order.ticketId, order.sessionToken, tickets);

              // Send email
              await addEmailToQueue({
                ticketId: order.ticketId,
                orderId: order.orderId,
                buyerInfo: order.buyerInfo,
                quantity: order.quantity,
              });

              console.log(`[Wompi API Polling] ✅ Wompi transaction ${wompiTxId} APPROVED. Order updated.`);
            } else if (['DECLINED', 'VOIDED', 'ERROR'].includes(transactionStatus)) {
              // Reject order
              const updated = rejectOrder(orderId, `Transacción Wompi: ${transactionStatus}. Detalle: ${transaction.status_message || ''}`);
              if (updated) order = updated;

              const tickets = await getDynamicTickets();

              // Release seat lock
              await releaseLock(order.ticketId, order.sessionToken, tickets);

              console.log(`[Wompi API Polling] ❌ Wompi transaction ${wompiTxId} ${transactionStatus}. Order updated.`);
            } else {
              console.log(`[Wompi API Polling] ⏳ Wompi transaction ${wompiTxId} is in status: ${transactionStatus}`);
            }
          } else {
            console.warn(`[Wompi API Polling] ⚠️ Transaction reference mismatch. Expected ${orderId}, got ${transaction?.reference}`);
          }
        } else {
          console.error(`[Wompi API Polling] ❌ Error response from Wompi API status code: ${response.status}`);
        }
      } catch (apiErr) {
        console.error('[Wompi API Polling] 🚨 Exception calling Wompi API:', apiErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      ticketId: order.ticketId,
      buyerInfo: order.buyerInfo,
      quantity: order.quantity,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentId: order.paymentId,
      errorDetail: order.errorDetail,
    });
  } catch (error) {
    console.error('[OrderStatus] 🚨 Error fetching order status:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
