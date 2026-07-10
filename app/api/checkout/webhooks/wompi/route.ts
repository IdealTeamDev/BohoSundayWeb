import { NextRequest, NextResponse } from 'next/server';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';
import crypto from 'crypto';

// Helper to validate the Wompi signature
function validateWompiSignature(body: any, eventsSecret: string): boolean {
  try {
    const { signature, timestamp } = body;
    if (!signature || !signature.properties || !signature.checksum || !timestamp) {
      return false;
    }

    let concatString = '';
    for (const prop of signature.properties) {
      const parts = prop.split('.'); // e.g. ["transaction", "id"]
      let value = body.data;
      for (const part of parts) {
        if (value) {
          value = value[part];
        }
      }
      concatString += value !== undefined ? String(value) : '';
    }

    concatString += String(timestamp);
    concatString += eventsSecret;

    const calculatedChecksum = crypto.createHash('sha256').update(concatString).digest('hex');
    return calculatedChecksum === signature.checksum;
  } catch (error) {
    console.error('[Wompi Webhook] Error validating signature:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(`[Wompi Webhook] 🔔 Received event: ${body.event}`);

    // Read the secret key
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

    if (eventsSecret && eventsSecret !== 'test_events_') {
      const isValid = validateWompiSignature(body, eventsSecret);
      if (!isValid) {
        console.error('[Wompi Webhook] ❌ Invalid signature checksum!');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('[Wompi Webhook] ✅ Signature verified successfully.');
    } else {
      console.warn('[Wompi Webhook] ⚠️ WOMPI_EVENTS_SECRET not configured or placeholder. Skipping signature validation.');
    }

    // Check if event is transaction.updated
    if (body.event !== 'transaction.updated') {
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    const transaction = body.data?.transaction;
    if (!transaction) {
      return NextResponse.json({ error: 'Missing transaction data' }, { status: 400 });
    }

    const orderId = transaction.reference;
    const status = transaction.status; // APPROVED, DECLINED, VOIDED, ERROR
    const paymentId = transaction.id;
    const amountInCents = transaction.amount_in_cents;

    console.log(`[Wompi Webhook] 🔍 Transaction details: ID=${paymentId}, Reference=${orderId}, Status=${status}, AmountCents=${amountInCents}`);

    if (!orderId) {
      console.warn(`[Wompi Webhook] ⚠️ Transaction ${paymentId} has no reference (orderId). Skipping.`);
      return NextResponse.json({ success: true, message: 'No reference' });
    }

    const order = getOrder(orderId);
    if (!order) {
      console.error(`[Wompi Webhook] ❌ Order ${orderId} not found in orderStore.`);
      return NextResponse.json({ error: 'Order not found' }, { status: 200 }); // Return 200 to Wompi so it stops retrying
    }

    const tickets = await getDynamicTickets();

    if (status === 'APPROVED') {
      if (order.status === 'approved') {
        console.log(`[Wompi Webhook] ℹ️ Order ${orderId} is already approved. Idempotent success.`);
        return NextResponse.json({ success: true, message: 'Already approved' });
      }

      // Check paid amount to prevent tampering
      const ticket = tickets.find((t) => t.id === order.ticketId);
      if (!ticket) {
        console.error(`[Wompi Webhook] ❌ Ticket ${order.ticketId} not found in database.`);
        return NextResponse.json({ error: 'Ticket not found' }, { status: 200 });
      }

      const expectedAmountInCents = (ticket.price * order.quantity) * 100;
      if (Math.abs(amountInCents - expectedAmountInCents) > 100) { // Tolerate small rounding diff (up to $1 COP in cents)
        console.error(`[Wompi Webhook] 🚨 Amount mismatch! Paid cents: ${amountInCents}, Expected cents: ${expectedAmountInCents}`);
        rejectOrder(orderId, `Amount mismatch. Paid cents: ${amountInCents}, expected: ${expectedAmountInCents}`);
        releaseLock(order.ticketId, order.sessionToken, tickets);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 200 });
      }

      // Approve order in memory
      await approveOrder(orderId, paymentId);

      // Permanently lock ticket
      markAsSold(order.ticketId, order.sessionToken, tickets);

      // Queue email confirmation
      await addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      console.log(`[Wompi Webhook] ✅ Order ${orderId} finalized and confirmation email queued.`);

    } else if (status === 'DECLINED' || status === 'VOIDED' || status === 'ERROR') {
      console.log(`[Wompi Webhook] ❌ Transaction for Order ${orderId} failed with status ${status}. Rejecting order and releasing lock.`);
      rejectOrder(orderId, `Wompi payment failed with status: ${status}`);
      releaseLock(order.ticketId, order.sessionToken, tickets);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Wompi Webhook] 🚨 Webhook processing crash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
