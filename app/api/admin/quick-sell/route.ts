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
    const { ticketId, quantity, buyerInfo, stageId } = body;

    if (!ticketId || !buyerInfo || !quantity) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 1. Obtener la lista dinámica de tickets
    const tickets = await getDynamicTickets(stageId);
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'El ticket/mesa seleccionado no existe' }, { status: 404 });
    }

    // 2. Si es una mesa/cama (no tiene stock definido), validar que no esté ya vendida
    if (ticket.stock === undefined) {
      const status = await getTicketStatus(ticketId, tickets);
      if (status === 'sold') {
        return NextResponse.json({ 
          error: 'Esta mesa/cama ya ha sido vendida y no se puede registrar otra venta' 
        }, { status: 400 });
      }
    } else {
      // 3. Si es boleto individual, validar stock restante
      const remaining = await getRemainingStock(ticketId, ticket.stock);
      if (remaining < Number(quantity)) {
        return NextResponse.json({ 
          error: `Stock insuficiente. Quedan ${remaining} boletas disponibles.` 
        }, { status: 400 });
      }
    }

    // Generate unique order ID
    const orderId = `ORD-QUICK-${ticketId.toUpperCase()}-${Date.now()}`;

    // Create order in memory (pass empty sessionToken for manual sale)
    createOrder(orderId, ticketId, '', buyerInfo, Number(quantity), 'wompi', stageId);

    // Immediately approve the order (handles stock reduction and admin notification email)
    await approveOrder(orderId, 'manual-sale');

    // Queue client email confirmation containing QR code
    await addEmailToQueue({
      ticketId,
      orderId,
      buyerInfo,
      quantity: Number(quantity),
    });

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
