'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { tickets } from '@/data/tickets';
import type { BuyerInfo } from '@/types/checkout';
import Image from 'next/image';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = params.ticketId as string;

  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<'loading' | 'approved' | 'rejected' | 'pending_verification'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ticket = tickets.find((t) => t.id === ticketId);

  useEffect(() => {
    // 1. Get orderId from query params (Mercado Pago redirects or Wompi redirects)
    const urlOrderId = searchParams.get('orderId') || searchParams.get('external_reference');
    const mpStatus = searchParams.get('status'); // approved, pending, rejected
    
    // 2. Fallback to sessionStorage
    const sessionOrderId = sessionStorage.getItem(`checkout_order_${ticketId}`);
    
    const targetOrderId = urlOrderId || sessionOrderId;

    if (!targetOrderId) {
      console.warn('No order ID found in URL or sessionStorage. Redirecting home.');
      router.replace('/');
      return;
    }

    setOrderId(targetOrderId);

    // If query parameters explicitly say payment rejected, mark immediately
    if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      setStatus('rejected');
      setErrorMsg('El pago fue rechazado o cancelado en la pasarela. Por favor intenta de nuevo.');
      return;
    }

    let pollAttempts = 0;
    const maxPollAttempts = 15; // 15 attempts * 2s = 30 seconds max polling
    let pollInterval: NodeJS.Timeout;

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/order-status?orderId=${targetOrderId}`);
        const data = await res.json();

        if (!res.ok) {
          // If order not found, fallback to sessionStorage if we have it
          const buyer = sessionStorage.getItem(`checkout_buyer_${ticketId}`);
          if (buyer) {
            const parsedBuyer = JSON.parse(buyer);
            const qtyStr = sessionStorage.getItem(`checkout_quantity_${ticketId}`) || '1';
            setBuyerInfo(parsedBuyer);
            setQuantity(parseInt(qtyStr, 10));
            
            // Generate QR
            const qrData = encodeURIComponent(
              JSON.stringify({ orderId: targetOrderId, ticketId, email: parsedBuyer.email })
            );
            setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`);
            setStatus('approved');
            clearInterval(pollInterval);
            return;
          }
          setErrorMsg(data.error || 'No pudimos verificar el estado de tu compra.');
          setStatus('rejected');
          clearInterval(pollInterval);
          return;
        }

        if (data.status === 'approved') {
          setBuyerInfo(data.buyerInfo);
          setQuantity(data.quantity);
          
          // Generate QR
          const qrData = encodeURIComponent(
            JSON.stringify({ orderId: targetOrderId, ticketId, email: data.buyerInfo.email })
          );
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`);
          setStatus('approved');
          
          // Save back to sessionStorage to persist on refresh
          sessionStorage.setItem(`checkout_buyer_${ticketId}`, JSON.stringify(data.buyerInfo));
          sessionStorage.setItem(`checkout_quantity_${ticketId}`, data.quantity.toString());
          sessionStorage.setItem(`checkout_order_${ticketId}`, targetOrderId);
          
          clearInterval(pollInterval);
        } else if (data.status === 'rejected') {
          setErrorMsg(data.errorDetail || 'El pago fue rechazado por la pasarela.');
          setStatus('rejected');
          clearInterval(pollInterval);
        } else {
          // Pending status
          pollAttempts += 1;
          if (pollAttempts >= maxPollAttempts) {
            // Stop polling and notify user it is still pending (async webhook delayed)
            setStatus('pending_verification');
            clearInterval(pollInterval);
          } else {
            // Keep status as loading but show a friendly polling notice if it takes too long
            if (pollAttempts > 3) {
              setStatus('pending_verification');
            }
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    };

    // Run immediately and start polling
    checkOrderStatus();
    pollInterval = setInterval(checkOrderStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [ticketId, searchParams, router]);

  function handleShare(method: 'copy' | 'whatsapp' | 'instagram' | 'facebook') {
    const message = `¡${ticket?.stock === undefined ? 'Mesa' : 'Boleta'} asegurada! 🎉\n${ticket?.name}${ticket?.stock === undefined ? ` #${ticket?.number}` : ''}\nOrden: ${orderId}\nMuestra este QR en la entrada.`;

    if (method === 'copy') {
      navigator.clipboard.writeText(qrUrl);
      alert('Enlace del QR copiado');
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else if (method === 'instagram') {
      navigator.clipboard.writeText(message);
      alert('Mensaje copiado — pégalo en Instagram');
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrUrl)}`);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#686A54] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-nunito text-[#231E1A] font-light text-center">Verificando transacción de pago...</p>
      </div>
    );
  }

  if (status === 'pending_verification') {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center border border-[#E8E2DA]">
          <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <h2 className="font-nunito font-semibold text-[18px] text-[#231E1A] mb-3">
            Validando pago con tu banco...
          </h2>
          <p className="font-nunito text-[14px] text-[#7A6F5E] mb-6 leading-relaxed">
            Estamos esperando la confirmación de la pasarela de pago. Esto puede tardar un momento.
            Te enviaremos un correo con tus entradas tan pronto como se reciba la confirmación de pago.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.replace('/')}
              className="w-full py-3 bg-[#686A54] hover:opacity-90 text-white font-semibold rounded-xl font-nunito uppercase tracking-wider text-[13px]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2 className="font-nunito font-semibold text-[18px] text-[#231E1A] mb-3">
            Pago Rechazado o Cancelado
          </h2>
          <p className="font-nunito text-[14px] text-[#7A6F5E] mb-6 leading-relaxed">
            {errorMsg || 'No se pudo completar el pago de tu reserva. Si el dinero fue descontado, por favor ponte en contacto con soporte.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.replace(`/checkout/${ticketId}`)}
              className="w-full py-3 bg-[#686A54] hover:opacity-90 text-white font-semibold rounded-xl font-nunito uppercase tracking-wider text-[13px]"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If approved:
  if (!buyerInfo || !ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center">

      {/* ============================================================ */}
      {/* ============   MÓVIL  (sin cambios)   ====================== */}
      {/* ============================================================ */}
      <div className="lg:hidden w-full bg-white shadow-sm overflow-hidden">

        {/* Hero image */}
        {ticket.img && (
          <div className="w-full h-50 overflow-hidden relative">
            <img src="/images/background/Banner pago exitoso-movil.png" alt={ticket.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        <div className="px-5 py-5 text-center bg-[#F4EFE9]">
            <div className='flex justify-center'>
              <img src="/images/icon/Íconos WEB 1.png" alt="Colombia Moda" width={100} className="rounded-lg" />
            </div>
            <h2 className="font-displayFlyer font-medium text-[26px] text-[#231E1A] leading-tight mb-1">
              ¡Tu pago ha sido<br />exitoso!
            </h2>
          {/* Success icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11L8.5 15.5L18 6" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="bg-[#686A54]/8 border border-[#686A54]/20 rounded-xl px-4 py-3 mb-4 mx-2">
            <p className="font-nunito text-[12px] text-[#231E1A] leading-relaxed text-center">
              Te hemos enviado un correo de confirmación con tu código QR a:<br />
              <strong className="text-[#231E1A]">{buyerInfo.email}</strong>
            </p>
          </div>

          {/* QR */}
          {qrUrl && (
            <div className="bg-[#D9D1C0] rounded-2xl p-5 mx-auto w-fit mb-3">
              <img src={qrUrl} alt="QR de acceso" width={160} height={160} className="rounded-lg" />
            </div>
          )}

          <p className="font-nunito font-semibold text-[14px] text-[#231E1A] mb-2">
            Tu {ticket.stock === undefined ? 'mesa tiene' : 'reserva es válida para'} <strong>{ticket.stock === undefined ? ticket.persons : quantity} {(ticket.stock === undefined ? ticket.persons : quantity) === 1 ? 'acceso' : 'accesos'}</strong>.<br />
          </p>
          <ul className="list-disc list-outinside pl-12 text-left font-nunito font-semibold text-[14px] text-[#231E1A]">
            <li>Comparte este código QR por WhastApp</li>
            <li><strong>Las camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres)</strong></li>
          </ul>

          {/* Share buttons */}
          <div className="flex gap-2 justify-center mb-4 mt-3.5">
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E0D9D0] font-nunito text-[12px] text-[#5A5248] hover:bg-[#FAF8F5] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copiar link
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E0D9D0] font-nunito text-[12px] text-[#5A5248] hover:bg-[#FAF8F5] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
          </div>

          <button
            onClick={() => router.replace('/')}
            className="w-full py-3 rounded-xl border border-[#E0D9D0] font-nunito text-[15px] bg-[#686A54] text-[#F4EFE9]  uppercase font-semibold hover:bg-[#FAF8F5] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ============   DESKTOP  (nuevo)   ========================== */}
      {/* ============================================================ */}
      <div className="hidden lg:flex w-full justify-center">
        <div className="w-full  bg-white shadow-sm overflow-hidden">

          {/* Banner desktop — pon aquí tu imagen exclusiva de desktop */}
          <div className="w-full overflow-hidden relative">
            <img
              src="/images/background/banner-pago-exitoso-desk.svg"
              alt={ticket.name}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Contenido en dos columnas */}
          <div className="bg-[#F4EFE9] px-60 py-8">
            <div className="flex gap-2  items-center">

              {/* ---------- Columna izquierda ---------- */}
              <div className="flex-1 justify-center items-center pt-2">
                <div className="flex justify-center items-center mb-5">
                  <img src="/images/icon/Íconos WEB 1.png" alt="Colombia Moda" width={130} />
                </div>

                <h2 className="font-displayFlyer text-center font-medium text-[48px] text-[#231E1A] leading-[1.05] mb-5">
                  ¡Tu pago ha sido<br />exitoso!
                </h2>
                <div className="flex justify-center items-center">
                  <p className="font-nunito font-semibold text-[18px] text-[#231E1A] mb-3">
                    Tu {ticket.stock === undefined ? 'mesa tiene' : 'reserva es válida para'}{' '}
                    <strong>
                      {ticket.stock === undefined ? ticket.persons : quantity}{' '}
                      {(ticket.stock === undefined ? ticket.persons : quantity) === 1 ? 'acceso' : 'accesos'}
                    </strong>.
                  </p>
                </div>
                <div className="flex justify-center items-center">
                  <ul className="list-disc list-outside pl-5 font-nunito font-semibold text-[15px] text-[#231E1A] space-y-1.5 mb-6">
                    <li>Comparte este código QR por WhatsApp</li>
                    <li><strong>Las camas fueron creadas para disfrutarse entre amigos, <br />en grupos mixtos (hombres y mujeres)</strong></li>
                  </ul>
                </div>
                {/* Share icons */}
                <div className="flex items-center justify-center gap-5">
                  <button onClick={() => handleShare('whatsapp')} aria-label="Compartir por WhatsApp" className="text-[#231E1A] hover:opacity-60 transition-opacity">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </button>

                  <button onClick={() => handleShare('instagram')} aria-label="Compartir por Instagram" className="text-[#231E1A] hover:opacity-60 transition-opacity">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13-.67-.66-1.34-1.08-2.13-1.38-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
                    </svg>
                  </button>

                  <button onClick={() => handleShare('facebook')} aria-label="Compartir por Facebook" className="text-[#231E1A] hover:opacity-60 transition-opacity">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.1 24 18.1 24 12.07z"/>
                    </svg>
                  </button>

                  <button onClick={() => handleShare('copy')} className="flex items-center gap-1.5 text-[#9B9389] hover:text-[#5A5248] transition-colors ml-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span className="font-nunito text-[13px]">Copiar link</span>
                  </button>
                  
                </div>
              </div>

              {/* ---------- Columna derecha ---------- */}
              <div className="flex flex-col items-center shrink-0">
                {/* Check verde */}
                <div className="w-16 h-16 bg-[#5A8A3A] rounded-full flex items-center justify-center mb-5">
                  <svg width="30" height="30" viewBox="0 0 22 22" fill="none">
                    <path d="M4 11L8.5 15.5L18 6" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* QR */}
                {qrUrl && (
                  <div className="bg-[#D9D1C0] rounded-2xl p-7">
                    <img src={qrUrl} alt="QR de acceso" width={250} height={250} className="rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Botón CERRAR centrado */}
            <div className="flex justify-center mt-10">
              <button
                onClick={() => router.replace('/')}
                className="px-24 py-3 rounded-xl bg-[#686A54] text-[#F4EFE9] uppercase font-semibold font-nunito text-[15px] hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}