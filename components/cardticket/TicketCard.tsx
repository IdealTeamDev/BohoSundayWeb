'use client';

import { useEffect } from "react";
import { zoneConfig } from '@/data/tickets';
import type {Ticket } from '@/types';


interface TicketCardProps{

    ticket: Ticket;
    onClose: () => void;
}

export default function TicketCard({ ticket, onClose }: TicketCardProps) {
  const cfg = zoneConfig[ticket.zone];
 
  const formattedPrice = new Intl.NumberFormat('es-CO').format(ticket.price);
 
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
 
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-white/[0.12] border-b-0 p-5 animate-slide-up"
        style={{ background: '#1e160e' }}
      >
        {/* Handle bar */}
        <div className="w-9 h-[3px] rounded-full bg-white/20 mx-auto mb-4" />
 
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/15 transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
 
        {/* Zone badge */}
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase rounded-full px-2 py-1 mb-2.5"
          style={{ background: cfg.color + '30', color: cfg.color }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.dotColor }}
          />
          {cfg.label}
        </div>
 
        {/* Title */}
        <h3 className="text-lg font-medium tracking-wider uppercase text-white/92 mb-1">
          {ticket.name} #{ticket.number}
        </h3>
        <p className="text-[12px] text-white/35 mb-4">
          Mesa #{ticket.number}
        </p>
 
        {/* Divider */}
        <div className="h-px bg-white/10 mb-3.5" />
 
        {/* Meta */}
        <div className="flex gap-4 mb-3.5">
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Personas</p>
            <p className="text-[13px] font-medium text-white/75">{ticket.persons}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Zona</p>
            <p className="text-[13px] font-medium" style={{ color: cfg.color }}>
              {cfg.label}
            </p>
          </div>
        </div>
 
        {/* Includes */}
        <div className="bg-white/[0.04] rounded-xl px-3 py-2.5 mb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Incluye</p>
          {[
            ticket.includes.licor,
            `${ticket.includes.agua} Agua`,
            `${ticket.includes.redBull} Red Bull`,
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
              <span className="text-[12px] text-white/60">{item}</span>
            </div>
          ))}
        </div>
 
        {/* Price */}
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-[11px] text-white/35 uppercase tracking-wider">Valor</p>
          <div>
            <span className="text-xl font-medium text-white/92">
              ${formattedPrice}
            </span>
            <span className="text-[12px] text-white/40 ml-1">COP</span>
          </div>
        </div>
 
        {/* CTA */}
        {ticket.available ? (
          <button
            className="w-full py-3.5 rounded-xl text-[12px] font-medium tracking-widest uppercase text-black/90 hover:opacity-88 transition-opacity"
            style={{ background: cfg.dotColor }}
            onClick={() => {
              // TODO: integrate with booking flow
              console.log('Reservar:', ticket.id);
            }}
          >
            Reservar esta mesa
          </button>
        ) : (
          <div className="w-full py-2.5 rounded-xl text-center text-[11px] uppercase tracking-widest bg-red-500/15 border border-red-400/30 text-red-300/70">
            Boleta agotada
          </div>
        )}
      </div>
    </div>
  );
}
 