'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { tickets } from '@/data/tickets';

export default function WompiMockPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = params.ticketId as string;
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const ticket = tickets.find((t) => t.id === ticketId);

  // Fetch current order status from orderStore to display details
  useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/checkout/order-status?orderId=${orderId}`);
        const data = await res.json();
        if (res.ok) {
          setOrderData(data);
        } else {
          setError(data.error || 'No se pudo cargar la información del pago.');
        }
      } catch (err) {
        setError('Error al conectar con el servidor.');
      }
    }

    fetchOrder();
  }, [orderId, router]);

  async function handleMockPayment(status: 'approved' | 'rejected') {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/webhooks/wompi-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al procesar el pago simulado.');
        setLoading(false);
        return;
      }

      // Redirect to the success screen which will query the order status
      router.push(`/checkout/${ticketId}/success?orderId=${orderId}`);
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full text-center">
          <p className="font-nunito text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.replace(`/checkout/${ticketId}`)}
            className="px-6 py-2 bg-[#686A54] text-white rounded-xl font-nunito"
          >
            Volver al Checkout
          </button>
        </div>
      </div>
    );
  }

  if (!orderData || !ticket) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPrice = ticket.price * orderData.quantity;
  const formattedPrice = new Intl.NumberFormat('es-CO').format(totalPrice);

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center justify-center px-4 py-8">
      {/* Wompi-styled Mock Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8E2DA] overflow-hidden">
        
        {/* Wompi Banner Header */}
        <div className="bg-[#1D1D24] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Wompi logo in white */}
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 32 L15.5 8 H21 L16.5 24 L21 8 H26.5 L19 32 H14.5 L19 16 L14.5 32 H8 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26.5 8 L32 25 L29 32 H35 L38 8 H32 L29 17 L32 8 H26.5 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-nunito font-bold text-lg tracking-wider">wompi</span>
          </div>
          <span className="bg-yellow-500 text-black font-nunito font-semibold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Modo Sandbox
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="font-nunito font-semibold text-[16px] text-[#231E1A] mb-4">
            Simulador de Pasarela de Pagos (Wompi)
          </h2>

          <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E8E2DA] mb-6 space-y-3">
            <div className="flex justify-between font-nunito text-[14px]">
              <span className="text-[#7A6F5E]">ID de Orden:</span>
              <span className="font-semibold text-[#231E1A]">{orderId}</span>
            </div>
            <div className="flex justify-between font-nunito text-[14px]">
              <span className="text-[#7A6F5E]">Comprador:</span>
              <span className="font-semibold text-[#231E1A]">{orderData.buyerInfo.name}</span>
            </div>
            <div className="flex justify-between font-nunito text-[14px]">
              <span className="text-[#7A6F5E]">Entrada:</span>
              <span className="font-semibold text-[#231E1A]">{ticket.name}</span>
            </div>
            <div className="flex justify-between font-nunito text-[14px]">
              <span className="text-[#7A6F5E]">Cantidad:</span>
              <span className="font-semibold text-[#231E1A]">{orderData.quantity}</span>
            </div>
            <div className="h-px bg-[#E8E2DA]" />
            <div className="flex justify-between font-nunito">
              <span className="font-semibold text-[#231E1A]">Total a Pagar:</span>
              <span className="font-bold text-[17px] text-[#231E1A]">${formattedPrice} COP</span>
            </div>
          </div>

          <p className="font-nunito text-[13px] text-[#7A6F5E] mb-6 text-center leading-relaxed">
            Esta pantalla es una simulación del widget de pagos de Wompi. Puedes elegir el resultado del pago para probar el comportamiento de tu sistema de boletería.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleMockPayment('approved')}
              disabled={loading}
              className="w-full py-3 bg-[#5A8A3A] hover:bg-[#4E7732] disabled:opacity-50 text-white font-nunito font-semibold rounded-xl text-[14px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Simular Pago Exitoso (Aprobado)'
              )}
            </button>
            
            <button
              onClick={() => handleMockPayment('rejected')}
              disabled={loading}
              className="w-full py-3 bg-[#C75A4E] hover:bg-[#B34B40] disabled:opacity-50 text-white font-nunito font-semibold rounded-xl text-[14px] uppercase tracking-wider transition-colors"
            >
              Simular Pago Rechazado (Fallido)
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-t border-[#E8E2DA] flex justify-between font-nunito text-[11px] text-[#9B9389]">
          <span>© Wompi Colombia</span>
          <span>Transacción Segura</span>
        </div>
      </div>
    </div>
  );
}
