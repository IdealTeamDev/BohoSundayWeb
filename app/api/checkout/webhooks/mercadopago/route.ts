import { NextRequest, NextResponse } from 'next/server';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Mercado Pago webhook triggers send payment id in query (IPN) or in body (Webhooks)
    let paymentId = searchParams.get('id') || searchParams.get('data.id');
    let topic = searchParams.get('topic') || searchParams.get('type');

    // Parse body if it's JSON
    try {
      const body = await req.json();
      if (body) {
        if (body.data && body.data.id) {
          paymentId = body.data.id;
        }
        if (body.type) {
          topic = body.type;
        }
      }
    } catch {
      // Body is empty or not JSON, fallback to query params
    }

    console.log(`[Webhook Mercado Pago] 🔔 Received webhook. Topic: ${topic}, Payment ID: ${paymentId}`);

    // If the notification is not about a payment, or doesn't have an ID, return 200 OK
    if ((topic && topic !== 'payment') || !paymentId) {
      return new Response(JSON.stringify({ success: true, message: 'Notification ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[Webhook Mercado Pago] ❌ MERCADOPAGO_ACCESS_TOKEN not configured. Cannot verify payment.');
      return new Response(JSON.stringify({ error: 'Webhook unconfigured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Secure verification: fetch payment details directly from Mercado Pago API
    console.log(`[Webhook Mercado Pago] 🔍 Verifying payment ${paymentId} with Mercado Pago...`);
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!mpRes.ok) {
      const errData = await mpRes.json();
      console.error(`[Webhook Mercado Pago] ❌ Failed to fetch payment details from MP API:`, errData);
      return new Response(JSON.stringify({ error: 'Failed to verify payment with provider' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentData = await mpRes.json();
    const orderId = paymentData.external_reference;
    const paymentStatus = paymentData.status;
    const transactionAmount = paymentData.transaction_amount;

    console.log(`[Webhook Mercado Pago] 🔍 Payment verified: OrderID=${orderId}, Status=${paymentStatus}, Amount=${transactionAmount}`);

    if (!orderId) {
      console.warn(`[Webhook Mercado Pago] ⚠️ Payment ${paymentId} has no external_reference (orderId). Skipping.`);
      return new Response(JSON.stringify({ success: true, message: 'No external reference' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = getOrder(orderId);
    if (!order) {
      console.error(`[Webhook Mercado Pago] ❌ Order ${orderId} not found in orderStore.`);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 200, // Return 200 so MP stops retrying for deleted/invalid orders
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tickets = await getDynamicTickets();

    // 1. If payment is APPROVED
    if (paymentStatus === 'approved') {
      if (order.status === 'approved') {
        console.log(`[Webhook Mercado Pago] ℹ️ Order ${orderId} was already approved. Idempotent success.`);
        return new Response(JSON.stringify({ success: true, message: 'Already approved' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check payment amount to prevent tampering
      const ticket = tickets.find((t) => t.id === order.ticketId);
      if (!ticket) {
        console.error(`[Webhook Mercado Pago] ❌ Ticket ${order.ticketId} not found in system.`);
        return new Response(JSON.stringify({ error: 'Ticket not found' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const expectedAmount = ticket.price * order.quantity;
      
      // Compare amount (allow float tolerance if needed)
      if (Math.abs(transactionAmount - expectedAmount) > 1) {
        console.error(`[Webhook Mercado Pago] 🚨 Payment amount mismatch! Paid: ${transactionAmount}, Expected: ${expectedAmount}`);
        rejectOrder(orderId, `Amount mismatch. Paid ${transactionAmount}, expected ${expectedAmount}`);
        await releaseLock(order.ticketId, order.sessionToken, tickets);
        return new Response(JSON.stringify({ error: 'Amount mismatch' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Approve order in memory
      await approveOrder(orderId, paymentId);

      // Permanently claim ticket lock
      await markAsSold(order.ticketId, order.sessionToken, tickets);

      // Queue and send confirmation email
      await addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      console.log(`[Webhook Mercado Pago] ✅ Order ${orderId} finalized and confirmation email sent.`);

    } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
      // 2. If payment was REJECTED / CANCELLED
      console.log(`[Webhook Mercado Pago] ❌ Payment for Order ${orderId} was ${paymentStatus}. Rejecting order & releasing lock.`);
      rejectOrder(orderId, `Payment ${paymentStatus} by provider.`);
      await releaseLock(order.ticketId, order.sessionToken, tickets);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Webhook Mercado Pago] 🚨 Webhook processing crash:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
