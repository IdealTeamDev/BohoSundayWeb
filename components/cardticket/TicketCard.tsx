'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { zoneConfig } from '@/data/zoneConfig';
import type { Ticket } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketCard({ ticket, onClose }: TicketCardProps) {
  const cfg = zoneConfig[ticket.zone];
  const router = useRouter();
  const formattedPrice = new Intl.NumberFormat('es-CO').format(ticket.price);

  const iconSrc = ticket.iconCard
    ? (ticket.iconCard.startsWith('/') ? ticket.iconCard : `/${ticket.iconCard}`)
    : `/${cfg.icon}`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleReserve() {
    try {
      const res = await fetch('/api/checkout/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Esta mesa ya está siendo procesada. Intenta en unos minutos.');
        return;
      }
      router.push(`/checkout/${ticket.id}`);
    } catch {
      alert('Error de conexión. Intenta nuevamente.');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center lg:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >

      {/* ── MÓVIL: drawer desde abajo ── */}
      <div
        className="lg:hidden w-full max-w-md rounded-t-2xl relative overflow-visible animate-slide-up"
        style={{ background: '#F4EFE9' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[-36px] right-4 z-50 w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold shadow-md"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Image */}
        <div className="w-full rounded-t-2xl overflow-hidden">
          <img
            src={ticket.img}
            alt={ticket.name}
            className="w-full h-auto block"
            width={880}
            height={20}
          />
        </div>

        <div className="p-5">
          {/* Title */}
          <div className="grid grid-cols-[44px_1fr] items-center gap-1 w-fit mx-auto">
            <img src={iconSrc} alt="" width={28} height={44} />
            <h2 className="text-3xl font-displayFlyer tracking-wider uppercase text-[#231E1A] my-4">
              {ticket.name} #{ticket.number}
            </h2>
            
          </div>
          {/* Description si existe */}
          {ticket.description && (
            <p className="text-[14px] text-center leading-[1.2] font-nunito font-light text-[#7A6F5E] mb-4 mx-16">
              {ticket.description}
            </p>
          )}
          

          {/* Meta */}
          <div className="flex items-center justify-center gap-15 mb-3.5 border-t border-b border-[#BDB39B]">
            <div className="flex flex-col items-center justify-center my-4">
              <p className="text-[19px] font-nunito text-[#231E1A]">{ticket.persons}</p>
              <p className="text-[16px] font-nunito font-extralight text-[#231E1A] mb-1">Personas</p>
            </div>
            <div className="flex flex-col justify-center">
              {[
                ticket.includes.licor,
                `${ticket.includes.agua} Agua`,
                `${ticket.includes.redBull} Red Bull`,
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-[15px] font-extralight font-nunito text-[#231E1A]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-center mt-3.5 mb-3.5">
            <span className="text-4xl font-semibold font-nunito text-[#231E1A]">
              ${formattedPrice}
            </span>
            <span className="text-4xl font-semibold font-nunito text-[#231E1A] ml-1">COP</span>
          </div>

          {/* CTA */}
          {ticket.available ? (
            <div className="flex justify-center mb-4 mt-4">
              <button
                className="w-55 py-2.5 rounded-lg text-[15px] font-semibold font-nunito uppercase text-[#F4EFE9] hover:opacity-88 transition-opacity"
                style={{ background: '#686A54' }}
                onClick={handleReserve}
              >
                Reservar esta mesa
              </button>
            </div>
          ) : (
            <div className="w-full py-2.5 rounded-lg text-center text-[11px] uppercase tracking-widest bg-red-500/15 border border-red-400/30 text-red-300/70">
              Boleta agotada
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: modal centrado horizontal ── */}
      <div
        className="hidden lg:flex w-full max-w-2xl rounded-2xl relative overflow-hidden shadow-2xl"
        style={{ background: '#F4EFE9' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-50 w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold shadow-md"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Imagen izquierda */}
        <div className="w-[45%] flex-shrink-0">
          <img
            src={ticket.img}
            alt={ticket.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info derecha */}
        <div className="flex flex-col justify-center px-8 py-8 flex-1">

          {/* Title */}
          <div className="flex items-center gap-3 mb-2">
            <img src={iconSrc} alt="" width={28} height={28} />
            <h2 className="text-3xl font-displayFlyer tracking-wider uppercase text-[#231E1A]">
              {ticket.name} #{ticket.number}
            </h2>
          </div>

          {/* Description si existe */}
          {ticket.description && (
            <p className="text-[14px] text-center leading-[1.2] font-nunito font-light text-[#7A6F5E] mb-4">
              {ticket.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-start gap-10 mb-4 border-t border-b border-[#BDB39B] py-4">
            <div className="flex flex-col items-center">
              <p className="text-[22px] font-nunito text-[#231E1A]">{ticket.persons}</p>
              <p className="text-[14px] font-nunito font-extralight text-[#231E1A]">Personas</p>
            </div>
            <div className="flex flex-col gap-1">
              {[
                ticket.includes.licor,
                `${ticket.includes.agua} Aguas`,
                `${ticket.includes.redBull} Red Bull`,
              ].map((item) => (
                <span key={item} className="text-[15px] font-extralight font-nunito text-[#231E1A]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className="text-[32px] font-semibold font-nunito text-[#231E1A]">
              $ {formattedPrice}
            </span>
            <span className="text-[32px] font-semibold font-nunito text-[#231E1A] ml-1">COP</span>
          </div>

          {/* CTA */}
          {ticket.available ? (
            <button
              className="w-full py-3 rounded-lg text-[15px] font-semibold font-nunito uppercase text-[#F4EFE9] hover:opacity-90 transition-opacity"
              style={{ background: '#686A54' }}
              onClick={handleReserve}
            >
              Reservar esta mesa
            </button>
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