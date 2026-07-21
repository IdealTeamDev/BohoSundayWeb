import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';
import { getDynamicTickets } from '@/lib/tickets';

export const revalidate = 0;

// GET: Fetch all active locks and current status of all tickets/beds
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    const queryKey = req.nextUrl.searchParams.get('api_key');
    const isValidQueryKey = secret && queryKey === secret;

    if (!isValidLegacy && !sessionUser && !isValidQueryKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Clean expired locks first
    await supabase
      .from('ticket_locks')
      .delete()
      .eq('status', 'locked')
      .lt('expires_at', new Date().toISOString());

    // 2. Fetch active locks from DB
    const { data: locks, error: locksError } = await supabase
      .from('ticket_locks')
      .select('*')
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString());

    if (locksError) {
      console.error('[Admin Locks API] Error fetching locks:', locksError);
      return NextResponse.json({ error: 'Error al consultar bloqueos' }, { status: 500 });
    }

    // 3. Fetch paid purchased tickets from DB
    const { data: purchases, error: purError } = await supabase
      .from('purchased_tickets')
      .select('*')
      .eq('status', 'paid');

    if (purError) {
      console.error('[Admin Locks API] Error fetching purchases:', purError);
      return NextResponse.json({ error: 'Error al consultar compras' }, { status: 500 });
    }

    const formattedLocks = (locks || []).map((l: any) => ({
      lockKey: l.lock_key,
      ticketId: l.ticket_id,
      sessionToken: l.session_token,
      quantity: l.quantity,
      status: l.status,
      expiresAt: l.expires_at,
      isAdminLock: l.session_token?.startsWith('admin'),
    }));

    const formattedPurchases = (purchases || []).map((p: any) => ({
      orderId: p.order_id,
      ticketId: p.ticket_id,
      ticketName: p.ticket_name,
      ticketNumber: p.ticket_number,
      zone: p.zone,
      buyerName: p.buyer_name,
      buyerEmail: p.buyer_email,
      buyerPhone: p.buyer_phone,
      createdAt: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      locks: formattedLocks,
      purchases: formattedPurchases,
    });
  } catch (error) {
    console.error('[Admin Locks API] GET Exception:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Lock or Unlock a ticket/cama
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
    const { action, ticketId, durationHours = 24, quantity = 1, note = '' } = body;

    if (!ticketId || !action) {
      return NextResponse.json({ error: 'Campos requeridos: action, ticketId' }, { status: 400 });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    const lockKey = (ticket && ticket.stock !== undefined) ? `${ticketId}_admin_manual` : ticketId;

    if (action === 'lock') {
      // 1. Check if already sold in purchased_tickets
      const { data: purchase } = await supabase
        .from('purchased_tickets')
        .select('order_id, buyer_name')
        .eq('ticket_id', ticketId)
        .eq('status', 'paid')
        .maybeSingle();

      if (purchase) {
        return NextResponse.json(
          { error: `No se puede bloquear: la entrada/mesa ya fue vendida a ${purchase.buyer_name || 'un cliente'} (Orden: ${purchase.order_id}).` },
          { status: 409 }
        );
      }

      // Calculate expiration time (default 24h for admin manual locks, or specified duration)
      const durationMs = (Number(durationHours) || 24) * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + durationMs).toISOString();

      const { error: upsertError } = await supabase
        .from('ticket_locks')
        .upsert({
          lock_key: lockKey,
          ticket_id: ticketId,
          session_token: `admin_manual_${Date.now()}`,
          quantity: quantity || 1,
          status: 'locked',
          expires_at: expiresAt,
        });

      if (upsertError) {
        console.error('[Admin Locks API] Error upserting lock:', upsertError);
        return NextResponse.json({ error: 'Error al registrar el bloqueo en base de datos' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `La entrada/cama ${ticket?.name || ticketId} ha sido BLOQUEADA exitosamente por el Staff.`,
        lockKey,
        ticketId,
        expiresAt,
      });

    } else if (action === 'unlock') {
      // Delete lock from database
      const { error: deleteError } = await supabase
        .from('ticket_locks')
        .delete()
        .or(`lock_key.eq.${lockKey},ticket_id.eq.${ticketId}`);

      if (deleteError) {
        console.error('[Admin Locks API] Error deleting lock:', deleteError);
        return NextResponse.json({ error: 'Error al desbloquear la entrada/cama' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `La entrada/cama ${ticket?.name || ticketId} ha sido DESBLOQUEADA y vuelve a estar disponible.`,
        ticketId,
      });

    } else {
      return NextResponse.json({ error: 'Acción no válida. Use "lock" o "unlock".' }, { status: 400 });
    }

  } catch (error) {
    console.error('[Admin Locks API] POST Exception:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
