'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { zoneConfig } from '@/data/zoneConfig';
import type { Ticket } from '@/types';

interface CardTicketIndividualProps {
  ticket: Ticket;
  remainingStock: number;
  onClose: () => void;
}

export default function CardTicketIndividual({ ticket, remainingStock, onClose }: CardTicketIndividualProps) {
  const cfg = zoneConfig[ticket.zone];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Maximum allowed per session is 10, or the remaining stock if less than 10
  const maxAllowed = Math.min(10, remainingStock);

  const formattedTotalPrice = new Intl.NumberFormat('es-CO').format(ticket.price * quantity);

  const iconSrc = ticket.iconCard
    ? (ticket.iconCard.startsWith('/') ? ticket.iconCard : `/${ticket.iconCard}`)
    : `/${cfg?.icon}`;

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleReserve() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'La cantidad seleccionada de boletas ya no está disponible. Intenta de nuevo.');
        return;
      }

      router.push(`/checkout/${ticket.id}`);
    } catch {
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center pointer-events-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-2xl relative overflow-visible animate-slide-up"
        style={{ background: '#F4EFE9' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[-36px] right-4 z-50 w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold shadow-md cursor-pointer"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Header Image */}
        <div className="w-full max-w-md rounded-t-2xl overflow-hidden">
          <img
            src={ticket.img}
            alt="Boho Sunday Colombia Moda Edition"
            className="w-full h-auto block"
            width={880}
            height={20}
          />
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Title & Icon */}
          <div className="grid grid-cols-[34px_1fr] items-center gap-1 w-fit mx-auto">
            <img
              src={iconSrc}
              alt="Boho Sunday Colombia Moda Edition"
              width={28}
              height={44}
            />
            <h2 className="text-3xl font-displayFlyer uppercase text-[#231E1A] my-2">
              {ticket.name}
            </h2>
          </div>

          {/* Subtitle / Schedule */}
          <div className="text-center font-nunito font-light text-[14px] text-[#231E1A] mb-2.5">
            {ticket.includes.licor}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#BDB39B]/50 mb-3.5" />

          {/* Availability Info */}
          <div className="flex flex-col items-center justify-center my-2">
            <p className="text-[14px] font-nunito font-light text-[#7A6F5E]">
              Solo se permiten 10 boletas por persona
            </p>
          </div>

          {/* Quantity text */}
          <div className="text-center font-nunito font-semibold text-[15px] text-[#231E1A] mt-2 mb-1">
            {quantity} {quantity === 1 ? 'boleta' : 'boletas'}
          </div>

          {/* Price Selector row: - $ Price + */}
          <div className="flex items-center justify-center gap-6 mt-1 mb-5">
            {/* Minus button */}
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || remainingStock <= 0}
              className="w-9 h-9 rounded-full border border-[#BDB39B] flex items-center justify-center text-xl font-light text-[#231E1A] hover:bg-[#E8E2DA] active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              -
            </button>

            <div className="flex flex-col items-center">
              <div>
                <span className="text-3xl font-bold font-nunito text-[#231E1A]">
                  ${formattedTotalPrice}
                </span>
                <span className="text-3xl font-bold font-nunito text-[#231E1A] ml-1">COP</span>
              </div>
              {quantity > 1 && (
                <span className="text-[12px] font-nunito text-[#7A6F5E] mt-0.5">
                  (${new Intl.NumberFormat('es-CO').format(ticket.price)} COP c/u)
                </span>
              )}
            </div>

            {/* Plus button */}
            <button
              onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
              disabled={quantity >= maxAllowed || remainingStock <= 0}
              className="w-9 h-9 rounded-full border border-[#BDB39B] flex items-center justify-center text-xl font-light text-[#231E1A] hover:bg-[#E8E2DA] active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              +
            </button>
          </div>

          {/* CTA */}
          {remainingStock > 0 ? (
            <div className="flex justify-center mb-4 mt-4">
              <button
                className="w-55 py-2.5 rounded-lg text-[15px] font-semibold font-nunito uppercase text-[#F4EFE9] hover:opacity-88 transition-opacity cursor-pointer disabled:opacity-50"
                style={{ background: '#686A54' }}
                onClick={handleReserve}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Reservar esta mesa'}
              </button>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded-lg text-center text-[11px] uppercase tracking-widest bg-red-500/15 border border-red-400/30 text-red-300/70">
              Boleta agotada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
