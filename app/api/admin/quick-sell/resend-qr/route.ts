import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Falta el orderId' }, { status: 400 });
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchased_tickets')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (purchaseError) {
      console.error('[Resend QR API] Database error:', purchaseError);
      return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
    }

    if (!purchase) {
      return NextResponse.json({ error: 'No se encontró la compra especificada' }, { status: 404 });
    }

    const buyerInfo = {
      name: purchase.buyer_name,
      phone: purchase.buyer_phone,
      email: purchase.buyer_email,
      locale: purchase.language?.toLowerCase() === 'en' ? 'en' : 'es'
    };

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === purchase.ticket_id);

    let quantity = 1;
    if (ticket && ticket.stock !== undefined) {
      quantity = Number(purchase.total_accesos);
    }

    await addEmailToQueue({
      ticketId: purchase.ticket_id,
      orderId: purchase.order_id,
      buyerInfo,
      quantity
    });

    return NextResponse.json({
      success: true,
      message: `QR reenviado exitosamente a ${purchase.buyer_email}`
    });

  } catch (error: any) {
    console.error('[Resend QR API] Exception:', error);
    return NextResponse.json({ error: 'Error interno al reenviar el QR' }, { status: 500 });
  }
}
