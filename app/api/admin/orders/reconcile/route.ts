import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/authStore';
import { supabase } from '@/lib/supabase';
import { getDynamicTickets } from '@/lib/tickets';
import { getActiveEdition } from '@/lib/editions';
import {
  verifyOrderWithWompi,
  forceApproveOrder,
  syncAllPendingOrders,
} from '@/lib/wompiReconciliation';

export const revalidate = 0;

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-admin-token');
  const secret = process.env.ADMIN_SECRET_TOKEN;
  const isValidLegacy = Boolean(secret && token === secret);
  const sessionUser = await validateSession(token);
  return Boolean(isValidLegacy || sessionUser);
}

/**
 * GET /api/admin/orders/reconcile
 * Returns pending orders from `orders` table so the admin can verify them with Wompi or force-approve them.
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const edition = searchParams.get('edition') || 'all';
    const zone = searchParams.get('zone') || 'all';
    const q = (searchParams.get('search') || '').trim().toLowerCase();

    const activeEdition = await getActiveEdition();

    const { data: rows, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[Admin Reconcile API] Error fetching pending orders:', error);
      return NextResponse.json({ error: 'Error consultando órdenes pendientes' }, { status: 500 });
    }

    const tickets = await getDynamicTickets(undefined, true, true);
    const ticketsMap = new Map(tickets.map((t) => [t.id.toLowerCase(), t]));

    const inferEditionFromDate = (createdAt?: string) => {
      if (!createdAt) return { slug: activeEdition.slug, name: activeEdition.name };
      const ts = new Date(createdAt).getTime();
      if (ts < new Date('2026-09-01T00:00:00Z').getTime()) {
        return { slug: 'colombiamoda', name: 'Colombiamoda' };
      }
      if (ts < new Date('2026-11-15T00:00:00Z').getTime()) {
        return { slug: 'entre-soles', name: 'Entre Soles' };
      }
      return { slug: activeEdition.slug, name: activeEdition.name };
    };

    const pendingOrders = (rows || [])
      .filter((r: any) => !String(r.order_id || '').startsWith('DRAFT-'))
      .map((r: any) => {
        const buyerInfo =
          typeof r.buyer_info === 'string'
            ? JSON.parse(r.buyer_info)
            : r.buyer_info || {};
        const ticket = ticketsMap.get(String(r.ticket_id || '').toLowerCase());
        const quantity = Number(r.quantity) || 1;
        const unitPrice = ticket ? ticket.price : 0;
        const inferred = inferEditionFromDate(r.created_at);
        const edSlug = r.edition_slug || inferred.slug;
        const edName = r.edition_name || inferred.name;

        return {
          orderId: r.order_id,
          ticketId: r.ticket_id,
          ticketName: ticket?.name || r.ticket_id,
          ticketNumber: ticket?.number || 0,
          zone: ticket?.zone || 'general',
          buyerName: buyerInfo.name || 'Sin nombre',
          buyerEmail: buyerInfo.email || '',
          buyerPhone: buyerInfo.phone || '',
          quantity,
          totalPrice: unitPrice * quantity,
          paymentMethod: r.payment_method || 'manual',
          paymentId: r.payment_id || '',
          status: r.status,
          createdAt: r.created_at,
          editionSlug: edSlug,
          editionName: edName,
        };
      })
      .filter((item: any) => {
        if (edition !== 'all' && item.editionSlug !== edition) {
          return false;
        }
        if (zone !== 'all' && String(item.zone || '').toLowerCase() !== zone.toLowerCase()) {
          return false;
        }
        if (q) {
          const haystack = `${item.orderId} ${item.buyerName} ${item.buyerEmail} ${item.buyerPhone} ${item.ticketName} ${item.ticketId}`.toLowerCase();
          return haystack.includes(q);
        }
        return true;
      });

    return NextResponse.json({
      success: true,
      pendingOrders,
      totalPending: pendingOrders.length,
    });
  } catch (error: any) {
    console.error('[Admin Reconcile API] GET Exception:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * POST /api/admin/orders/reconcile
 * Actions:
 * - 'verify': Verify a single order against Wompi/MercadoPago API (optionally passing wompiTxId)
 * - 'force_approve': Force approve a pending order, register in purchased_tickets, and send QR email
 * - 'sync_all': Reconcile all recent pending orders against Wompi
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorized(req))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, orderId, wompiTxId, paymentRef, hoursBack = 48 } = body;

    if (action === 'sync_all') {
      const summary = await syncAllPendingOrders({
        hoursBack: Number(hoursBack) || 48,
        force: true,
      });
      return NextResponse.json({
        success: true,
        message:
          summary.approvedCount > 0
            ? `¡Se encontraron y aprobaron ${summary.approvedCount} orden(es) pagada(s) en Wompi! Sus códigos QR ya fueron emitidos y enviados por correo.`
            : `Se verificaron ${summary.checkedCount} orden(es) pendiente(s) contra Wompi. Ninguna figura como aprobada todavía.`,
        ...summary,
      });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    if (action === 'verify') {
      const result = await verifyOrderWithWompi(orderId, {
        wompiTxId: wompiTxId || undefined,
        autoRejectOnDecline: false,
      });
      return NextResponse.json({
        success: result.newStatus === 'approved',
        result,
        message: result.message,
      });
    }

    if (action === 'force_approve') {
      const result = await forceApproveOrder(orderId, paymentRef || wompiTxId);
      return NextResponse.json({
        success: result.newStatus === 'approved',
        result,
        message: result.message,
      });
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Reconcile API] POST Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar la orden' },
      { status: 500 }
    );
  }
}
