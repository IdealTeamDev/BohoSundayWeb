import { NextRequest, NextResponse } from 'next/server';
import { verifyLock, getRemainingSeconds } from '@/lib/lockStore';
import { createOrder } from '@/lib/orderStore';
import { tickets } from '@/data/tickets';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, buyerInfo, quantity, paymentMethod } = await req.json();

    if (!ticketId || !buyerInfo || !quantity || !paymentMethod) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const sessionToken = req.cookies.get(`checkout_token_${ticketId}`)?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    // Verify lock is still valid
    const isLocked = verifyLock(ticketId, sessionToken);
    if (!isLocked) {
      return NextResponse.json({
        error: 'Tu tiempo de reserva expiró. Por favor regresa a la página principal.',
      }, { status: 410 });
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    const remainingSeconds = getRemainingSeconds(ticketId, sessionToken);
    const isIndividual = ticket.stock !== undefined;
    const finalQty = isIndividual ? quantity : 1;
    const totalPrice = ticket.price * finalQty;

    // Generate unique order ID
    const orderId = `ORD-${ticketId.toUpperCase()}-${Date.now()}`;

    // Create pending order
    createOrder(orderId, ticketId, sessionToken, buyerInfo, finalQty, paymentMethod);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (paymentMethod === 'mercadopago') {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

      // Fallback: If Mercado Pago credentials are not configured, use a simulation redirect
      if (!accessToken) {
        console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN not configured. Returning simulated Mercado Pago checkout URL.');
        
        // Setup a mock URL that takes them directly to our success page with simulation parameters
        const mockRedirectUrl = `${siteUrl}/checkout/${ticketId}/success?external_reference=${orderId}&payment_id=mock-mp-payment-${Date.now()}&status=approved`;
        
        return NextResponse.json({
          success: true,
          orderId,
          checkoutUrl: mockRedirectUrl,
        });
      }

      // Prepare expiration date matching the lock expiration
      const expirationDateStr = new Date(Date.now() + remainingSeconds * 1000).toISOString();

      // Mercado Pago requires HTTPS for auto_return. We only enable it if the siteUrl is secure.
      const useAutoReturn = siteUrl.startsWith('https://');

      // Create Mercado Pago Preference using REST API
      const mpPreferenceBody: any = {
        items: [
          {
            id: ticketId,
            title: `${ticket.name} - Boho Sunday`,
            quantity: finalQty,
            unit_price: ticket.price,
            currency_id: 'COP',
          },
        ],
        payer: {
          name: buyerInfo.name,
          email: buyerInfo.email,
        },
        back_urls: {
          success: `${siteUrl}/checkout/${ticketId}/success`,
          failure: `${siteUrl}/checkout/${ticketId}/success`,
          pending: `${siteUrl}/checkout/${ticketId}/success`,
        },
        external_reference: orderId,
        notification_url: `${siteUrl}/api/checkout/webhooks/mercadopago`,
        expires: true,
        date_of_expiration: expirationDateStr,
      };

      if (useAutoReturn) {
        mpPreferenceBody.auto_return = 'approved';
      }

      console.log(`[Mercado Pago] 🚀 Creating preference for Order ${orderId}. Expiration: ${expirationDateStr}`);
      
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mpPreferenceBody),
      });

      const mpData = await mpRes.json();

      if (!mpRes.ok) {
        console.error('[Mercado Pago] ❌ Preference creation failed:', mpData);
        return NextResponse.json({
          error: 'Error al generar la pasarela de Mercado Pago. Intenta nuevamente.',
        }, { status: 502 });
      }

      // Return sandbox_init_point for testing, fallback to init_point
      const checkoutUrl = mpData.sandbox_init_point || mpData.init_point;
      console.log(`[Mercado Pago] ✅ Preference created. Checkout URL: ${checkoutUrl}`);

      return NextResponse.json({
        success: true,
        orderId,
        checkoutUrl,
      });

    } else {
      // Wompi (Simulated flow for this phase)
      const checkoutUrl = `${siteUrl}/checkout/${ticketId}/wompi-mock?orderId=${orderId}`;
      console.log(`[Wompi] 🚀 Redirecting to Wompi Mock: ${checkoutUrl}`);

      return NextResponse.json({
        success: true,
        orderId,
        checkoutUrl,
      });
    }

  } catch (error: any) {
    console.error('[PaymentSession] 🚨 Error creating payment session:', error);
    return NextResponse.json({ error: 'Error procesando el inicio de pago' }, { status: 500 });
  }
}
