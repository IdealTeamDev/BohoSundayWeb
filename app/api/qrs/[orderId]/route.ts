import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderAccesses } from '@/lib/orderStore';
import { getDynamicTickets } from '@/lib/tickets';
import { validateSession } from '@/lib/authStore';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// GET: Returns the detailed purchase info JSON (for QR display)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    // 1. Query Supabase purchased_tickets table first
    const { data: ticketRecord, error: dbError } = await supabase
      .from('purchased_tickets')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (ticketRecord) {
      const isEnglish = (ticketRecord.language || '').toUpperCase() === 'EN';
      return NextResponse.json({
        order_id: ticketRecord.order_id,
        ticket_id: ticketRecord.ticket_id,
        ticket_name: ticketRecord.ticket_name,
        ticket_number: ticketRecord.ticket_number,
        zone: ticketRecord.zone,
        buyer_name: ticketRecord.buyer_name,
        buyer_email: ticketRecord.buyer_email,
        buyer_phone: ticketRecord.buyer_phone,
        buyer_locale: isEnglish ? 'INGLES' : 'ESPAÑOL',
        total_accesos: ticketRecord.total_accesos,
        accesos_restantes: ticketRecord.accesos_restantes,
        status: ticketRecord.status,
        checksum: ticketRecord.checksum,
        payment_ref: ticketRecord.payment_ref || 'N/A',
        created_at: ticketRecord.created_at,
        ticket_price: ticketRecord.ticket_price
      });
    }

    // 2. Fallback to in-memory store (for local testing/development)
    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === order.ticketId);

    const ticketName = ticket?.name || 'Boleto/Cama';
    const ticketNumber = ticket?.number || 0;
    const zone = ticket?.zone || 'general';

    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalCapacity = basePersons * order.quantity;

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
      buyer_locale: order.buyerInfo.locale === 'en' ? 'INGLES' : 'ESPAÑOL',
      total_accesos: totalCapacity,
      accesos_restantes: remainingAccesses,
      status: jsonStatus,
      checksum: checksum,
      payment_ref: order.paymentId || order.errorDetail || 'N/A',
      created_at: new Date(order.createdAt).toISOString(),
      ticket_price: ticket?.price || 0
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
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = validateSession(token);
    
    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await context.params;
    const body = await req.json();
    const count = Number(body.count) || 1;

    // 1. Query Supabase purchased_tickets table first
    const { data: ticketRecord, error: dbError } = await supabase
      .from('purchased_tickets')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (ticketRecord) {
      if (ticketRecord.status !== 'paid') {
        return NextResponse.json({ success: false, error: 'La orden no está en estado aprobado/pagado' }, { status: 400 });
      }

      const currentUsed = ticketRecord.total_accesos - ticketRecord.accesos_restantes;
      const newUsed = currentUsed + count;

      if (newUsed > ticketRecord.total_accesos) {
        return NextResponse.json({
          success: false,
          error: `Límite de accesos excedido. Capacidad: ${ticketRecord.total_accesos}, Usados: ${currentUsed}, Solicitados: ${count}`,
          remaining: ticketRecord.accesos_restantes
        }, { status: 400 });
      }

      const newRemaining = ticketRecord.total_accesos - newUsed;
      const { error: updateError } = await supabase
        .from('purchased_tickets')
        .update({ accesos_restantes: newRemaining })
        .eq('order_id', orderId);

      if (updateError) {
        console.error(`[QR Check-In] ❌ Error updating remaining accesses in Supabase for ${orderId}:`, updateError);
        return NextResponse.json({ success: false, error: 'Error al actualizar accesos en la base de datos' }, { status: 500 });
      }

      console.log(`[QR Check-In] 🎟️ Access validation via Supabase: order ${orderId} used ${count} more access(es). Total used: ${newUsed}/${ticketRecord.total_accesos}`);

      return NextResponse.json({
        success: true,
        accesos_restantes: newRemaining
      });
    }

    // 2. Fallback to in-memory store (for local testing/development)
    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === order.ticketId);

    const basePersons = ticket ? (ticket.stock !== undefined ? 1 : (ticket.persons || 1)) : 1;
    const totalCapacity = basePersons * order.quantity;

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
