'use client';

import { useState, useRef, useEffect } from 'react';
import { tickets } from '@/data/tickets';
import { zoneConfig } from '@/data/zoneConfig';
import type { Ticket } from '@/types';
import TicketCard from '@/components/cardticket/TicketCard';

interface EventMapProps {
  onClose: () => void;
}

// Zonas informativas — sin interacción
const infoZones = [
  {
    id: 'pasarela',
    label: 'PASARELA',
    left: '6%', top: '45.5%', width: '30%', height: '7%',
    bg: 'white',
    textColor: '#231E1A',
    vertical: false,
  },
  {
    id: 'dancefloor',
    label: 'DANCE FLOOR',
    left: '72.5%', top: '37.5%', width: '7%', height: '20.5%',
    bg: '#F4EFE9',
    border: 'rgba(255,255,255,0.25)',
    textColor: '#231E1A',
    vertical: true,
  },
  {
    id: 'dj',
    label: 'DJ',
    left: '79.8%', top: '41%', width: '6.5%', height: '15%',
    bg: '#231E1A',
    border: 'rgba(139,92,246,0.45)',
    textColor: '#F4EFE9',
    vertical: true,
  },
  {
    id: 'backstage',
    label: 'BACKSTAGE',
    left: '86.5%', top: '36%', width: '8%', height: '26%',
    bg: '#9797FF',
    border: 'rgba(96,165,250,0.5)',
    textColor: '#FFF8D5',
    vertical: true,
  },
];

const DOT_PX = 28;

export default function EventMap({ onClose }: EventMapProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, 'available' | 'locked' | 'sold'>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [dotSize, setDotSize] = useState(DOT_PX);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          const mapping: Record<string, 'available' | 'locked' | 'sold'> = {};
          data.forEach((item: { id: string; status: 'available' | 'locked' | 'sold' }) => {
            mapping[item.id] = item.status;
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

  useEffect(() => {
    function updateDotSize() {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const size = Math.max(16, Math.min(28, Math.floor(w * 0.05)));
      setDotSize(size);
    }
    updateDotSize();
    const ro = new ResizeObserver(updateDotSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleDotClick = (ticket: Ticket) => {
    const status = ticketStatuses[ticket.id] || 'available';
    const isAvailable = ticket.available && status === 'available';
    if (!isAvailable) return;
    if (selectedZone && ticket.zone !== selectedZone) return;
    setSelectedTicket(ticket);
  };

  return (
    <div className="w-full bg-[#F4EFE9] shadow-lg rounded-2xl overflow-visible select-none relative">
        <button
          onClick={onClose}
          className="absolute top-[-36px] right-2 z-50 w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold shadow-md"
          aria-label="Cerrar"
        >
          ✕
        </button>
      {/* ── Legend ── */}
      <div className="relative grid grid-cols-2 gap-2 justify-items-left px-4 pt-3 pb-2">
        

        {Object.entries(zoneConfig).map(([zone, cfg]) => {
          const isSelected = selectedZone === zone;
          return (
            <button
              key={zone}
              onClick={() => setSelectedZone(isSelected ? null : zone)}
              className="flex gap-2 items-center text-[#7A6F5E] font-nunito font-light text-sm border rounded-full px-3 py-1.5 border-[#BDB39B] cursor-pointer hover:bg-[#E8E2DA] transition-all"
              style={
                isSelected
                  ? {
                      borderColor: '#231E1A',
                      color: '#231E1A',
                      fontWeight: '600',
                    }
                  : {}
              }
            >
              <img
                src={isSelected ? (cfg.iconActive || cfg.icon.replace('.png', '-active.png')) : cfg.icon}
                alt="Boho Sunday Colombia Moda Edition"
                width={cfg.width}
              />
              <span>{cfg.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* ── Map ── */}
      <div ref={containerRef} className="relative w-full rounded-b-2xl overflow-hidden">
        <img
          src="/images/background/mapaboho.png"
          alt="Mapa del venue Boho Sunday"
          className="w-full h-auto block"
          draggable={false}
        />

        {/* ── Zonas informativas ── */}
        {infoZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: zone.left,
              top: zone.top,
              width: zone.width,
              height: zone.height,
              background: zone.bg,
            }}
          >
            <span
              className="font-nunito font-bold uppercase tracking-wider text-center"
              style={{
                fontSize: `${Math.max(6, dotSize * 0.45)}px`,
                color: zone.textColor,
                writingMode: zone.vertical ? 'vertical-rl' : 'horizontal-tb',
                lineHeight: 1.2,
              }}
            >
              {zone.label}
            </span>
          </div>
        ))}

        {/* ── Puntos de tickets ── */}
        {tickets.map((ticket) => {
          const cfg = zoneConfig[ticket.zone];
          const status = ticketStatuses[ticket.id] || 'available';
          const isAvailable = ticket.available && status === 'available';

          const isSelectedZone = selectedZone === null || ticket.zone === selectedZone;
          const isInteractive = isAvailable && isSelectedZone;
          const opacity = isSelectedZone
            ? (isAvailable ? 1 : 0.38)
            : 0.15;

          return (
            <button
              key={ticket.id}
              aria-label={`${ticket.name} #${ticket.number} — ${isAvailable ? 'Disponible' : 'Agotado'}`}
              onClick={() => handleDotClick(ticket)}
              disabled={!isInteractive}
              style={{
                position: 'absolute',
                left: `${ticket.position.x}%`,
                top: `${ticket.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                background: cfg.dotColor,
                opacity: opacity,
                borderRadius: '50%',
                border: '1.5px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isInteractive ? 'pointer' : 'not-allowed',
                pointerEvents: isSelectedZone ? 'auto' : 'none',
                zIndex: 10,
                transition: 'transform 0.15s ease, opacity 0.2s ease',
                fontSize: `${Math.max(6, dotSize * 0.42)}px`,
                fontWeight: '700',
                color: ticket.zone === 'bohemian' || ticket.zone === 'oasis'
                  ? 'rgba(0,0,0,0.8)'
                  : 'rgba(255,255,255,0.95)',
                fontFamily: 'var(--font-nunito, sans-serif)',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                if (isInteractive)
                  (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)';
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