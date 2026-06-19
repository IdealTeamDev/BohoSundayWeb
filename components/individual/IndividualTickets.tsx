'use client';

import { useState, useEffect } from 'react';
import { tickets } from '@/data/tickets';
import CardTicketIndividual from '@/components/cardticket/CardTicketIndividual';
import type { Ticket } from '@/types';

interface IndividualTicketsProps {
  onClose: () => void;
}

export default function IndividualTickets({ onClose }: IndividualTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, { status: string; remaining: number }>>({});

  const earlyTicket = tickets.find((t) => t.id === 'early');
  const anytimeTicket = tickets.find((t) => t.id === 'anytime');

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          const mapping: Record<string, { status: string; remaining: number }> = {};
          data.forEach((item: { id: string; status: string; remaining?: number }) => {
            mapping[item.id] = {
              status: item.status,
              remaining: item.remaining ?? 1,
            };
          });
          setTicketStatuses(mapping);
        }
      } catch (error) {
        console.error('Error fetching ticket statuses:', error);
      }
    }
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const earlyRemaining = ticketStatuses['early']?.remaining ?? earlyTicket?.stock ?? 0;
  const anytimeRemaining = ticketStatuses['anytime']?.remaining ?? anytimeTicket?.stock ?? 0;

  return (
    <div className="w-full bg-[#F4EFE9] shadow-lg rounded-2xl overflow-visible select-none relative pt-10 pb-10 px-6 flex flex-col items-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-[-36px] right-2 z-50 w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold shadow-md cursor-pointer"
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* Palm Icon */}
      <img
        src="/images/icon/icon-general.png"
        alt="Boho Palm Logo"
        width={36}
        height={36}
        className="object-contain"
      />

      {/* Title */}
      <h2 className="font-displayFlyer text-center text-4xl uppercase text-[#231E1A] mt-3 mb-8">
        GENERAL
      </h2>

      {/* Tickets List */}
      <div className="w-full flex flex-col gap-5 max-w-sm">
        
        {/* ENTRADA EARLY */}
        <button
          onClick={() => earlyTicket && setSelectedTicket(earlyTicket)}
          className="w-full h-36 rounded-2xl overflow-hidden shadow-md relative hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-[#BDB39B]/30"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("images/individual-ticket/early.png")',
            backgroundColor: '#4E4F44',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="font-nunito font-light text-[14px] uppercase text-white/80 transition-colors group-hover:text-white">
              ENTRADA
            </span>
            <span className="font-displayFlyer text-4xl uppercase text-[#F4EFE9] mt-0.5 transition-transform group-hover:scale-105 duration-300">
              EARLY
            </span>
            <span className="font-nunito font-light text-[12px] text-white/70 mt-1 bg-black/35 px-2 py-0.5 rounded-full">
            </span>
          </div>
        </button>

        {/* ENTRADA ANYTIME */}
        <button
          onClick={() => anytimeTicket && setSelectedTicket(anytimeTicket)}
          className="w-full h-36 rounded-2xl overflow-hidden shadow-md relative hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-[#BDB39B]/30"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("images/individual-ticket/anytime.png")',
            backgroundColor: '#45463C',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="font-nunito font-light text-[14px] uppercase text-white/80 transition-colors group-hover:text-white">
              ENTRADA
            </span>
            <span className="font-displayFlyer text-4xl uppercase text-[#F4EFE9] mt-0.5 transition-transform group-hover:scale-105 duration-300">
              ANYTIME
            </span>
            <span className="font-nunito font-light text-[12px] text-white/70 mt-1 bg-black/35 px-2 py-0.5 rounded-full">
            </span>
          </div>
        </button>

      </div>

      {/* ── Ticket card individual ── */}
      {selectedTicket && (
        <CardTicketIndividual
          ticket={selectedTicket}
          remainingStock={ticketStatuses[selectedTicket.id]?.remaining ?? (selectedTicket.stock || 0)}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
