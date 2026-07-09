import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderAccesses } from '@/lib/orderStore';
import { getDynamicTickets } from '@/lib/tickets';
import crypto from 'crypto';

// GET: Returns the detailed purchase info JSON (for QR display)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const order = getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === order.ticketId);

    const ticketName = ticket?.name || 'Boleto/Cama';
    const ticketNumber = ticket?.number || 0;
    const zone = ticket?.zone || 'general';

    // Calculate total capacity
    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalCapacity = basePersons * order.quantity;

    // Checksum
    const checksum = crypto
      .createHash('sha256')
      .update(`${order.orderId}-${order.buyerInfo.email}-${order.paymentId || ''}-${order.status}`)
      .digest('hex')
      .substring(0, 16);

    const jsonStatus = order.status === 'approved' ? 'paid' : 'failed';

    const accessesUsed = order.accessesUsed || 0;
    const remainingAccesses = Math.max(0, totalCapacity - accessesUsed);

    return NextResponse.json({
      order_id: order.orderId,
      ticket_id: order.ticketId,
      ticket_name: ticketName,
      ticket_number: ticketNumber,
      zone: zone,
      buyer_name: order.buyerInfo.name,
      buyer_email: order.buyerInfo.email,
      buyer_phone: order.buyerInfo.phone,
      total_accesos: totalCapacity,
      accesos_restantes: remainingAccesses,
      status: jsonStatus,
      checksum: checksum,
      payment_ref: order.paymentId || order.errorDetail || 'N/A',
      created_at: new Date(order.createdAt).toISOString()
    });
  } catch (error) {
    console.error('Error generating dynamic QR JSON:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Validates and consumes accesses for the ticket check-in
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const body = await req.json();
    const count = Number(body.count) || 1;

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === order.ticketId);

    // Calculate total capacity
    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalCapacity = basePersons * order.quantity;

    // Validate and update accesses in the store
    const result = updateOrderAccesses(orderId, count, totalCapacity);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        remaining: result.remaining
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      accesos_restantes: result.remaining
    });
  } catch (error) {
    console.error('Error validating check-in accesses:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
