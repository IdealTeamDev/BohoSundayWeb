import { NextRequest, NextResponse } from 'next/server';
import { verifyLock, getRemainingSeconds, markAsSold } from '@/lib/lockStore';
import { createOrder, approveOrder } from '@/lib/orderStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { tickets } from '@/data/tickets';
import crypto from 'crypto';

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

    // BYPASS MODE (To test local checkout without gateway redirects)
    if (process.env.BYPASS_PAYMENT === 'true') {
      console.log(`[Bypass Payment] ⚡ BYPASS_PAYMENT is enabled. Simulating instant approval...`);
      approveOrder(orderId, `bypass-${Date.now()}`);
      markAsSold(ticketId, sessionToken);
      try {
        await addEmailToQueue({
          ticketId,
          orderId,
          buyerInfo,
          quantity: finalQty,
        });
      } catch (e) {
        console.error('[Bypass Payment] Email queue error:', e);
      }

      const mockRedirectUrl = `${siteUrl}/checkout/${ticketId}/success?orderId=${orderId}`;
      return NextResponse.json({
        success: true,
        orderId,
        checkoutUrl: mockRedirectUrl,
      });
    }

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
      // Wompi Integration (Real/Simulated fallback)
      const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      const wompiIntegrityKey = process.env.WOMPI_INTEGRITY_KEY;

      // If keys are not configured or are placeholder text, fallback to simulation
      if (!wompiPublicKey || !wompiIntegrityKey || wompiPublicKey === 'pub_test_' || wompiIntegrityKey === 'test_integrity_') {
        console.warn('⚠️ Wompi credentials not configured in .env. Falling back to simulated Wompi checkout.');
        const mockRedirectUrl = `${siteUrl}/checkout/${ticketId}/wompi-mock?orderId=${orderId}`;
        return NextResponse.json({
          success: true,
          orderId,
          checkoutUrl: mockRedirectUrl,
        });
      }

      const amountInCents = totalPrice * 100;
      const currency = 'COP';

      // Generate Wompi integrity signature: reference + amountInCents + currency + integrityKey
      const signatureRaw = `${orderId}${amountInCents}${currency}${wompiIntegrityKey}`;
      const signature = crypto.createHash('sha256').update(signatureRaw).digest('hex');

      // Construct Web Checkout URL
      let checkoutUrl = `https://checkout.wompi.co/p/?public-key=${wompiPublicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${orderId}&signature%3Aintegrity=${signature}`;

      // Only append redirect-url if it uses secure HTTPS to prevent CloudFront 403 blocks (which trigger on http:// or localhost)
      const redirectUrl = `${siteUrl}/checkout/${ticketId}/success?orderId=${orderId}`;
      if (redirectUrl.startsWith('https://')) {
        checkoutUrl += `&redirect-url=${encodeURIComponent(redirectUrl)}`;
      } else {
        console.warn(`[Wompi] ⚠️ siteUrl is not secure HTTPS (${siteUrl}). Omitting 'redirect-url' parameter to prevent CloudFront 403 errors.`);
      }

      console.log(`[Wompi] 🚀 Redirecting to Wompi Web Checkout: ${checkoutUrl}`);

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
