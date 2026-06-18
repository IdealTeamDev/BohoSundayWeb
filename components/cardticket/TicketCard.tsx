'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { zoneConfig } from '@/data/zoneConfig';
import type {Ticket } from '@/types';


interface TicketCardProps{

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
 
  // Close on Escape key
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
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-2xl relative overflow-visible animate-slide-up"
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

        {/* Handle bar */}
        <div className="w-full max-w-md rounded-t-2xl overflow-hidden">
          <img
            src={ticket.img}
            alt="Boho Sunday Colombia Moda Edition"
            className="w-full h-auto block"
            width={880}
            height={20}
          />
        </div>
 
        {/* Zone badge */}
        <div className="p-5">
  
          <div className="grid grid-cols-[44px_1fr] items-center gap-1 w-fit mx-auto">
            <img
                 src={iconSrc}
                 alt="Boho Sunday Colombia Moda Edition"
                  width={28}
                  height={44}
             />
            <h2 className="text-3xl font-displayFlyer tracking-wider uppercase text-[#231E1A] my-4">
              {ticket.name} #{ticket.number}
            </h2>
          </div>
  
          {/* Divider */}
          <div className="h-px bg-white/10 mb-3.5" />
  
          {/* Meta */}
          <div className="flex items-center justify-center gap-15 mb-3.5 border-t border-b border-[#BDB39B] ">
            <div className="flex flex-col items-center justify-center my-4">
              <p className="text-[19px] font-nunito  text-[#231E1A]">{ticket.persons}</p>
              <p className="text-[16px] font-nunito font-extralight text-[#231E1A] mb-1">Personas</p>
              
            </div>
            <div className="flex flex-col justify-center">
              {/* Includes */}
            {[
              ticket.includes.licor,
              `${ticket.includes.agua} Agua`,
              `${ticket.includes.redBull} Red Bull`,
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-[15px] font-extralight font-nunito text-[#231E1A]">{item}</span>
              </div>
            ))}
              {/*<p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Zona</p>
              <p className="text-[13px] font-medium" style={{ color: cfg.color }}>
                {cfg.label}
              </p>*/}
            </div>
          </div>
  
          {/* Price */}
  
          <div className="flex items-center justify-center mt-3.5 mb-3.5">
            <div>
              <span className="text-4xl font-semibold font-nunito text-[#231E1A]">
                ${formattedPrice}
              </span>
              <span className="text-4xl font-semibold font-nunito text-[#231E1A] ml-1">COP</span>
            </div>
          </div>
  
          {/* CTA */}
          {ticket.available ? (
            <div className="flex justify-center mb-4 mt-4">
              <button
                className="w-55 py-2.5 rounded-lg text-[15px] font-semibold font-nunito uppercase text-[#F4EFE9] hover:opacity-88 transition-opacity"
                style={{ background: '#686A54' }}
                onClick={handleReserve}>
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
    </div>
  );
}
 