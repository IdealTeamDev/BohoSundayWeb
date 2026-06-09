'use client';

import { useState } from 'react';
import { tickets, zoneConfig } from '@/data/tickets';
import type { Ticket } from '@/types';
import TicketCard from '@/components/cardticket/TicketCard';

interface EventMapProps {
  onClose: () => void
}

export default function EventMap({ onClose}: EventMapProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleDotClick = (ticket: Ticket) => {
    if (!ticket.available) return;
    setSelectedTicket(ticket);
  };

  return (
    <div className="relative w-full bg-[#1a120a] rounded-2xl overflow-hidden select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs font-medium text-white/90 uppercase tracking-widest">
          Mapa del evento
        </p>
        <p className="text-[11px] text-white/40 mt-0.5">
          Toca una boleta para ver los detalles
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-4 py-2 border-b border-white/[0.08]">
        {(Object.entries(zoneConfig) as [keyof typeof zoneConfig, typeof zoneConfig[keyof typeof zoneConfig]][]).map(([zone, cfg]) => (
          <div key={zone} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: cfg.dotColor }}
            />
            <span className="text-[10px] text-white/55">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Map area */}
      <div className="relative w-full" style={{ paddingBottom: '95%' }}>
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_50%,#2a1f10_0%,#1a120a_70%)]" />

        {/* Pool */}
        <div className="absolute left-[36%] top-[28%] w-[28%] h-[38%] bg-gradient-to-br from-[#0d4a6e] via-[#0a3550] to-[#062840] rounded-xl border border-sky-400/30 flex items-center justify-center">
          <span className="text-[9px] text-sky-200/60 tracking-widest uppercase text-center">
            Piscina
          </span>
        </div>

        {/* Stage / DJ labels */}
        <div className="absolute right-[3%] top-[28%] w-[7%] h-[38%] bg-indigo-500/20 border border-indigo-400/50 rounded flex items-center justify-center">
          <span className="text-[8px] text-indigo-300/80 [writing-mode:vertical-rl] tracking-wider uppercase">
            Backstage
          </span>
        </div>
        <div className="absolute right-[11%] top-[28%] w-[6%] h-[38%] bg-violet-500/15 border border-violet-400/40 rounded flex items-center justify-center">
          <span className="text-[8px] text-violet-300/70 [writing-mode:vertical-rl] tracking-widest uppercase">
            DJ
          </span>
        </div>
        <div className="absolute right-[18%] top-[44%] w-[12%] h-[20%] bg-black/50 border border-white/[0.08] rounded flex items-center justify-center">
          <span className="text-[7px] text-white/30 tracking-wider uppercase text-center">
            Dance<br />Floor
          </span>
        </div>

        {/* Ticket dots */}
        {tickets.map((ticket) => {
          const cfg = zoneConfig[ticket.zone];
          return (
            <button
              key={ticket.id}
              aria-label={`${ticket.name} #${ticket.number} — ${ticket.available ? 'Disponible' : 'Agotado'}`}
              onClick={() => handleDotClick(ticket)}
              style={{
                left: `${ticket.position.x}%`,
                top: `${ticket.position.y}%`,
                background: cfg.dotColor,
                transform: 'translate(-50%, -50%)',
              }}
              className={[
                'absolute w-5 h-5 rounded-full flex items-center justify-center',
                'text-[7px] font-semibold border border-white/20 z-10',
                'transition-transform duration-150',
                ticket.available
                  ? 'cursor-pointer hover:scale-125 active:scale-110 text-black/80'
                  : 'opacity-35 cursor-not-allowed text-black/60',
              ].join(' ')}
            >
              {ticket.number}
            </button>
          );
        })}
      </div>

      {/* Ticket card overlay */}
      {selectedTicket && (
        <TicketCard
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}