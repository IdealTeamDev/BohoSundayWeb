'use client';

import { useState, useRef, useEffect } from 'react';
import { tickets } from '@/data/tickets';
import { zoneConfig } from '@/data/zoneConfig';
import type { Ticket } from '@/types';
import TicketCard from '@/components/cardticket/TicketCard';

interface EventMapProps {
  onClose: () => void;
}

// Dot size in px — we use a fixed px size so numbers are always readable
// but scale slightly on very small screens
const DOT_PX = 28;

export default function EventMap({ onClose }: EventMapProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dotSize, setDotSize] = useState(DOT_PX);

  // Adjust dot size based on actual container width
  useEffect(() => {
    function updateDotSize() {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      // At 320px wide → 22px dots, at 500px+ → 28px dots
      const size = Math.max(20, Math.min(28, Math.floor(w * 0.057)));
      setDotSize(size);
    }
    updateDotSize();
    const ro = new ResizeObserver(updateDotSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleDotClick = (ticket: Ticket) => {
    if (!ticket.available) return;
    setSelectedTicket(ticket);
  };

  return (
    <div className="w-full bg-[#F4EFE9] shadow-lg mb-3 rounded-2xl overflow-hidden select-none">

      {/* ── Header ── */}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 w-9 h-3  rounded-full bg-[#F4EFE9] flex items-center justify-center text-[#231E1A] hover:bg-white/15 transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>


          {/*seleccion de boletas*/}

      <div className="grid grid-cols-2 gap-2 justify-items-left px-4 py-8">
        <div className="flex gap-3 items-center text-[#BDB39B] font-nunito font-extralight text-xs border rounded-full p-2 border-[#BDB39B]">
          <img src="images/icon/icons-tickets.png" alt="" width={20}/>
          <p>CAMAS VIP</p>
          </div>
        <div className="font-nunito text-[#BDB39B] text-xs border rounded-full p-2 border-[#BDB39B]">MESA OASIS</div>
        <div className="font-nunito text-[#BDB39B] text-xs border rounded-full p-2 border-[#BDB39B]">BACKSTAGE</div>
        <div className="font-nunito text-[#BDB39B] text-xs border rounded-full p-2 border-[#BDB39B]">MESA CANDELA</div>
        <div className="font-nunito text-[#BDB39B] text-xs border rounded-full p-2 border-[#BDB39B]">CAMA BOHEMIAN</div>
        <div className="font-nunito text-[#BDB39B] text-xs border rounded-full p-2 border-[#BDB39B]">CAMA LUJOPRIMITIVO</div>
      </div>

      {/* ── Map ── */}
      <div ref={containerRef} className="relative w-full">
        {/* The image defines the container height via aspect ratio */}
        <img
          src="/images/background/mapaboho.png"
          alt="Mapa del venue Boho Sunday"
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Backstage label overlay */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '82%',
            top: '34%',
            width: '10%',
            height: '28%',
            background: 'rgba(59,130,246,0.35)',
            border: '1px solid rgba(96,165,250,0.6)',
            borderRadius: '6px',
          }}
        >
          <span
            className="text-blue-200 font-nunito font-semibold uppercase tracking-wider"
            style={{ fontSize: `${Math.max(7, dotSize * 0.38)}px`, writingMode: 'vertical-rl' }}
          >
            Backstage
          </span>
        </div>

        {/* Ticket dots — positioned as % of the image */}
        {tickets.map((ticket) => {
          const cfg = zoneConfig[ticket.zone];

          // Skip backstage — it has its own zone label above
          if (ticket.zone === 'backstage') return null;

          return (
            <button
              key={ticket.id}
              aria-label={`${ticket.name} #${ticket.number} — ${ticket.available ? 'Disponible' : 'Agotado'}`}
              onClick={() => handleDotClick(ticket)}
              style={{
                position: 'absolute',
                left: `${ticket.position.x}%`,
                top: `${ticket.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                background: ticket.available ? cfg.dotColor : cfg.dotColor,
                opacity: ticket.available ? 1 : 0.4,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: ticket.available ? 'pointer' : 'not-allowed',
                zIndex: 10,
                transition: 'transform 0.15s ease',
                fontSize: `${Math.max(7, dotSize * 0.38)}px`,
                fontWeight: '700',
                color: ticket.zone === 'bohemian' ? '#2a1f0a' : 'rgba(255,255,255,0.95)',
                fontFamily: 'var(--font-nunito, sans-serif)',
              }}
              onMouseEnter={(e) => {
                if (ticket.available) (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)';
              }}
            >
              {ticket.number}
            </button>
          );
        })}

        {/* Backstage clickable dot */}
        {tickets.filter(t => t.zone === 'backstage').map(ticket => {
          const cfg = zoneConfig[ticket.zone];
          return (
            <button
              key={ticket.id}
              aria-label="Backstage — toca para ver detalles"
              onClick={() => handleDotClick(ticket)}
              style={{
                position: 'absolute',
                left: '85%',
                top: '48%',
                transform: 'translate(-50%, -50%)',
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                background: cfg.dotColor,
                opacity: ticket.available ? 1 : 0.4,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: ticket.available ? 'pointer' : 'not-allowed',
                zIndex: 11,
                fontSize: `${Math.max(7, dotSize * 0.38)}px`,
                fontWeight: '700',
                color: 'rgba(255,255,255,0.95)',
                fontFamily: 'var(--font-nunito, sans-serif)',
              }}
            >
              {ticket.number}
            </button>
          );
        })}
      </div>

      {/* ── Ticket card ── */}
      {selectedTicket && (
        <TicketCard
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}