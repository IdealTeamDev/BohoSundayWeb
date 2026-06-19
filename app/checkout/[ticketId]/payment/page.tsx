'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets } from '@/data/tickets';
import CountdownTimer from '@/components/checkout/CountdownTimer';
import type { BuyerInfo } from '@/types/checkout';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ticket = tickets.find((t) => t.id === ticketId);

  const verifySession = useCallback(async () => {
    const res = await fetch(`/api/checkout/verify?ticketId=${ticketId}`);
    const data = await res.json();
    setSessionValid(data.valid);
    if (data.valid) {
      setRemainingSeconds(data.remainingSeconds);
      if (typeof data.quantity === 'number') {
        setQuantity(data.quantity);
      }
    }
    if (!data.valid) router.replace('/');
  }, [ticketId, router]);

  useEffect(() => {
    verifySession();
    const buyer = sessionStorage.getItem(`checkout_buyer_${ticketId}`);
    if (!buyer) router.replace(`/checkout/${ticketId}`);
  }, [verifySession, ticketId, router]);

  useEffect(() => {
    if (!sessionValid) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) { clearInterval(interval); router.replace('/'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionValid, router]);

  async function handlePayment() {
    setProcessing(true);
    setError(null);

    try {
      const buyerInfo: BuyerInfo = JSON.parse(
        sessionStorage.getItem(`checkout_buyer_${ticketId}`) || '{}'
      );

      const res = await fetch('/api/checkout/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, buyerInfo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error procesando el pago');
        setProcessing(false);
        return;
      }

      // Save order ID for success page
      sessionStorage.setItem(`checkout_order_${ticketId}`, data.orderId);
      router.push(`/checkout/${ticketId}/success`);

    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setProcessing(false);
    }
  }

  if (sessionValid === null || !ticket) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPrice = ticket.stock !== undefined ? ticket.price * quantity : ticket.price;
  const formattedPrice = new Intl.NumberFormat('es-CO').format(totalPrice);

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center px-4 py-8">

      <CountdownTimer seconds={remainingSeconds} ticketName={`${ticket.name}${ticket.stock === undefined ? ` #${ticket.number}` : ''}`} />

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm mt-4 overflow-hidden">

        {ticket.img && (
          <div className="w-full h-28 overflow-hidden">
            <img src={`/${ticket.img}`} alt={ticket.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-5 py-5">
          <h2 className="font-nunito font-semibold text-[15px] uppercase tracking-wider text-[#231E1A]">
            {ticket.name}{ticket.stock === undefined ? ` #${ticket.number}` : ''}
          </h2>
          <p className="font-nunito text-[12px] text-[#9B9389] mt-0.5 mb-4">
            {ticket.stock !== undefined ? quantity : ticket.persons} {ticket.stock !== undefined ? (quantity === 1 ? 'persona' : 'personas') : 'personas'}
          </p>

          {/* Order summary */}
          <div className="bg-[#FAF8F5] rounded-xl px-4 py-3 mb-4">
            <p className="font-nunito text-[10px] uppercase tracking-wider text-[#9B9389] mb-2">
              Resumen
            </p>
            <div className="flex justify-between items-center">
              <span className="font-nunito text-[13px] text-[#5A5248]">
                {ticket.name} · {ticket.stock !== undefined ? quantity : ticket.persons} {ticket.stock !== undefined ? (quantity === 1 ? 'boleta' : 'boletas') : 'personas'}
              </span>
              <span className="font-nunito font-semibold text-[13px] text-[#231E1A]">
                ${formattedPrice}
              </span>
            </div>
            <div className="h-px bg-[#E8E2DA] my-2" />
            <div className="flex justify-between items-center">
              <span className="font-nunito text-[13px] font-semibold text-[#231E1A]">Total</span>
              <span className="font-nunito font-bold text-[15px] text-[#231E1A]">
                ${formattedPrice} COP
              </span>
            </div>
          </div>

          {/* Simulated payment notice */}
          <div className="bg-[#686A54]/8 border border-[#686A54]/20 rounded-xl px-4 py-3 mb-4">
            <p className="font-nunito text-[11px] text-[#686A54] leading-relaxed text-center">
              Pasarela de pago en configuración.<br />
              Este es un pago de prueba — no se realizará ningún cobro real.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="font-nunito text-[12px] text-red-600 text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-3.5 rounded-xl bg-[#686A54] text-white font-nunito font-semibold text-[13px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              'Finalizar compra'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}