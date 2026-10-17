import { NextRequest, NextResponse } from 'next/server';
import { createOrder, approveOrder } from '@/lib/orderStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';
import { getTicketStatus, getRemainingStock } from '@/lib/lockStore';
import { validateSession } from '@/lib/authStore';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId: rawTicketId, quantity, buyerInfo, stageId } = body;

    if (!rawTicketId || !buyerInfo || !quantity) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const isGuestRequest = rawTicketId === 'invitado_anytime' || rawTicketId === 'invitado-anytime';
    const ticketId = isGuestRequest ? 'invitado_anytime' : String(rawTicketId).trim();

    // 1. Obtener la lista dinámica de tickets sin excluir por etapa (incluyendo tickets especiales de admin como Invitado Anytime)
    const tickets = await getDynamicTickets(stageId, true, true);
    const ticket = tickets.find(
      (t) =>
        t.id === ticketId ||
        t.id.toLowerCase() === ticketId.toLowerCase() ||
        (isGuestRequest && (t.id === 'invitado_anytime' || t.id === 'invitado-anytime'))
    );

    if (!ticket) {
      return NextResponse.json({ error: 'El ticket/mesa seleccionado no existe' }, { status: 404 });
    }

    // 2. Si es una mesa/cama (no tiene stock definido), validar que no esté ya vendida
    if (ticket.stock === undefined && !isGuestRequest) {
      const status = await getTicketStatus(ticket.id, tickets);
      if (status === 'sold') {
        return NextResponse.json({ 
          error: 'Esta mesa/cama ya ha sido vendida y no se puede registrar otra venta' 
        }, { status: 400 });
      }
    } else if (!isGuestRequest) {
      // 3. Si es boleto individual normal, validar stock restante
      const remaining = await getRemainingStock(ticket.id, ticket.stock ?? 100);
      if (remaining < Number(quantity)) {
        return NextResponse.json({ 
          error: `Stock insuficiente. Quedan ${remaining} boletas disponibles.` 
        }, { status: 400 });
      }
    }

    // Normalize buyerInfo fields on the backend as well
    const normalizedBuyerInfo = {
      name: String(buyerInfo.name || '').trim(),
      phone: String(buyerInfo.phone || '').trim(),
      email: String(buyerInfo.email || '').trim(),
      locale: buyerInfo.locale === 'en' ? ('en' as const) : ('es' as const),
    };

    // Generate unique order ID
    const orderId = `ORD-QUICK-${ticket.id.toUpperCase()}-${Date.now()}`;

    // Create order in database (pass empty sessionToken for manual sale)
    const createdOrder = await createOrder(
      orderId,
      ticket.id,
      '',
      normalizedBuyerInfo,
      Number(quantity),
      'wompi',
      stageId
    );

    // Immediately approve the order (passes createdOrder as fallback so purchased_tickets is always written)
    await approveOrder(orderId, 'manual-sale', createdOrder);

    // Queue client email confirmation containing QR code with a timeout guard
    // so slow SMTP retries on Vercel never cause a 504 timeout before returning the QR modal to the admin.
    try {
      await Promise.race([
        addEmailToQueue({
          ticketId: ticket.id,
          orderId,
          buyerInfo: normalizedBuyerInfo,
          quantity: Number(quantity),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email dispatch timed out (sale already saved)')), 5500)
        ),
      ]);
    } catch (emailErr) {
      console.warn(`[Quick Sell] ⚠️ Sale ${orderId} was recorded in DB, but email dispatch was deferred/failed:`, emailErr);
    }

    console.log(`[Quick Sell] ✅ Manual sale successfully registered for Order ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error: any) {
    console.error('[Quick Sell API] 🚨 Exception registering manual sale:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la venta' }, { status: 500 });
  }
}
