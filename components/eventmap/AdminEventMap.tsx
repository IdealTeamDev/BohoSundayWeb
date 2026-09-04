'use client';

import { useState, useRef, useEffect } from 'react';
import { zoneConfig } from '@/data/zoneConfig';
import type { Ticket } from '@/types';

interface AdminEventMapProps {
  onSelectTicketForSale?: (ticketId: string) => void;
  onRefreshStats?: () => void;
  onViewPurchase?: (orderId: string) => void;
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

export default function AdminEventMap({ onSelectTicketForSale, onRefreshStats, onViewPurchase }: AdminEventMapProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, 'available' | 'locked' | 'sold'>>({});
  const [locksData, setLocksData] = useState<any[]>([]);
  const [purchasesData, setPurchasesData] = useState<any[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dotSize, setDotSize] = useState(DOT_PX);

  const fetchTicketsAndStatuses = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

      // 1. Fetch tickets metadata
      const resTickets = await fetch(`/api/tickets?nocache=${Date.now()}`);
      let ticketsList: Ticket[] = [];
      if (resTickets.ok) {
        ticketsList = await resTickets.json();
        setAllTickets(ticketsList);
      }

      // 2. Fetch admin locks and purchases
      const resLocks = await fetch('/api/admin/quick-sell/locks', {
        headers: { 'x-admin-token': token }
      });

      if (resLocks.ok) {
        const locksJson = await resLocks.json();
        setLocksData(locksJson.locks || []);
        setPurchasesData(locksJson.purchases || []);

        const mapping: Record<string, 'available' | 'locked' | 'sold'> = {};
        
        // Build status mapping for every ticket
        ticketsList.forEach((t: any) => {
          mapping[t.id] = t.status || 'available';
        });

        // Override with locks and purchases data
        (locksJson.purchases || []).forEach((p: any) => {
          mapping[p.ticketId] = 'sold';
        });

        (locksJson.locks || []).forEach((l: any) => {
          if (mapping[l.ticketId] !== 'sold') {
            mapping[l.ticketId] = 'locked';
          }
        });

        setTicketStatuses(mapping);
      }
    } catch (error) {
      console.error('[AdminEventMap] Error fetching map data:', error);
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    fetchTicketsAndStatuses();
    const interval = setInterval(fetchTicketsAndStatuses, 4000);
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
    setStatusMessage(null);
    setSelectedTicket(ticket);
  };

  const handleLockAction = async (ticketId: string, action: 'lock' | 'unlock') => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/quick-sell/locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          action,
          ticketId,
          durationHours: 24,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        await fetchTicketsAndStatuses();
        if (onRefreshStats) onRefreshStats();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Error al procesar la acción.' });
      }
    } catch (err) {
      console.error('[AdminEventMap] Error in handleLockAction:', err);
      setStatusMessage({ type: 'error', text: 'Error de red al actualizar el estado del bloqueo.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper stats for header badge
  const totalBeds = allTickets.filter(t => t.zone !== 'general').length;
  const soldBeds = Object.values(ticketStatuses).filter(s => s === 'sold').length;
  const lockedBeds = Object.values(ticketStatuses).filter(s => s === 'locked').length;
  const availableBeds = Math.max(0, totalBeds - soldBeds - lockedBeds);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-5 items-start w-full">
      
      {/* LEFT: MAP CANVAS & CONTROLS */}
      <div className="w-full bg-[#FAF8F5] border border-[#E8E2DA] shadow-sm rounded-3xl overflow-hidden select-none relative font-sans">
        
        {/* Header and Status Legend Bar */}
        <div className="bg-[#686A54] px-6 py-4 text-white flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            <h2 className="font-bold text-base tracking-wide uppercase flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.818V8.052a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              MAPA DE MESAS Y CAMAS (TIEMPO REAL STAFF)
            </h2>
            <p className="text-xs text-[#E0D9D0]">Haz clic en cualquier mesa para seleccionar y ver sus detalles.</p>
          </div>

          {/* Legend pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white font-bold border border-white/20 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
              Disponibles: {availableBeds}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#F59E0B]/20 text-[#FCD34D] font-bold border border-[#F59E0B]/40 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              🔒 Bloqueadas: {lockedBeds}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-200 font-bold border border-red-500/40 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
              Vendidas: {soldBeds}
            </span>
          </div>
        </div>

        {/* Zone Filters Bar */}
        <div className="px-6 pt-4 pb-2 bg-[#F4EFE9] border-b border-[#E8E2DA] flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-[#7A6F5E] uppercase tracking-wider mr-2">Filtrar por Zona:</span>
          <button
            type="button"
            onClick={() => setSelectedZone(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedZone === null
                ? 'bg-[#686A54] text-white border-[#686A54] shadow-sm'
                : 'bg-white text-[#7A6F5E] border-[#E0D9D0] hover:bg-[#FAF8F5]'
            }`}
          >
            TODAS LAS ZONAS
          </button>

          {Object.entries(zoneConfig).filter(([zone]) => zone !== 'general').map(([zone, cfg]) => {
            const isSelected = selectedZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(isSelected ? null : zone)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#686A54] text-white border-[#686A54] shadow-sm'
                    : 'bg-white text-[#7A6F5E] border-[#E0D9D0] hover:bg-[#FAF8F5]'
                }`}
              >
                <span>{cfg.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* ── Interactive Map Canvas ── */}
        <div ref={containerRef} className="relative w-full overflow-hidden bg-[#FAF8F5]">
          {loadingMap && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-[#686A54] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#686A54]">Cargando mapa en tiempo real...</span>
              </div>
            </div>
          )}

          <img
            src="/images/background/mapaboho.png"
            alt="Mapa del venue Boho Sunday"
            className="w-full h-auto block"
            draggable={false}
          />

          {/* Informative Zones */}
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
                className="font-bold uppercase tracking-wider text-center"
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

          {/* Render Table Dots */}
          {allTickets.filter(t => t.zone !== 'general').map((ticket) => {
            const cfg = zoneConfig[ticket.zone] || zoneConfig.vip;
            const status = ticketStatuses[ticket.id] || 'available';
            const isSelectedZone = selectedZone === null || ticket.zone === selectedZone;
            const isSelectedTicket = selectedTicket?.id === ticket.id;

            let dotBg = cfg.dotColor;
            let dotBorder = '2px solid white';
            let textColor = ticket.zone === 'bohemian' || ticket.zone === 'oasis' ? 'rgba(0,0,0,0.85)' : '#FFFFFF';
            let dotShadow = 'none';

            if (status === 'locked') {
              dotBg = '#F59E0B';
              dotBorder = '2px solid #78350F';
              textColor = '#FFFFFF';
              dotShadow = '0 0 10px rgba(245, 158, 11, 0.8)';
            } else if (status === 'sold') {
              dotBg = '#B24A34';
              dotBorder = '2px solid #7F1D1D';
              textColor = '#FFFFFF';
            }

            if (isSelectedTicket) {
              dotBorder = '3px solid #F3F0E8';
              dotShadow = '0 0 0 4px rgba(90, 96, 70, 0.6)';
            }

            const opacity = isSelectedZone ? 1 : 0.2;

            return (
              <button
                key={ticket.id}
                type="button"
                aria-label={`Mesa ${ticket.name} #${ticket.number} — ${status}`}
                onClick={() => handleDotClick(ticket)}
                style={{
                  position: 'absolute',
                  left: `${ticket.position.x}%`,
                  top: `${ticket.position.y}%`,
                  transform: isSelectedTicket ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%)',
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  background: dotBg,
                  opacity: opacity,
                  borderRadius: '50%',
                  border: dotBorder,
                  boxShadow: dotShadow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: isSelectedTicket ? 30 : status === 'locked' ? 20 : 10,
                  transition: 'all 0.15s ease',
                  fontSize: `${Math.max(6, dotSize * 0.42)}px`,
                  fontWeight: '800',
                  color: textColor,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSelectedTicket) (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.25)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelectedTicket) (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)';
                }}
                title={`${ticket.name} #${ticket.number} (${status.toUpperCase()})`}
              >
                {status === 'locked' ? '🔒' : ticket.number}
              </button>
            );
          })}
        </div>

      </div>

      {/* RIGHT: SIDE DETAILS CARD (.card.detail) matching the reference design */}
      <div className="card detail bg-white border border-[#E3DDCD] rounded-2xl shadow-sm overflow-hidden sticky top-24 font-sans text-sm">
        {selectedTicket ? (
          <>
            <div className="card-head border-b border-[#EFEADC] p-4 bg-[#FAF8F5]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#26261F] capitalize">
                  {selectedTicket.zone} · Mesa {selectedTicket.number}
                </h3>
                <p className="text-xs text-[#6A695C] mt-0.5">
                  {selectedTicket.name} · hasta {selectedTicket.persons || 8} personas
                </p>
              </div>
            </div>

            <div className="card-body p-4 space-y-2">
              <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                <span className="text-[#6A695C]">Estado</span>
                <b>
                  {ticketStatuses[selectedTicket.id] === 'sold' && (
                    <span className="pill pill-sold px-2 py-0.5 rounded-full text-[11px] bg-[#F8E7E2] text-[#B24A34] font-medium">Vendida</span>
                  )}
                  {ticketStatuses[selectedTicket.id] === 'locked' && (
                    <span className="pill pill-warn px-2 py-0.5 rounded-full text-[11px] bg-[#FAF0D8] text-[#B07D1E] font-medium">Bloqueada</span>
                  )}
                  {(ticketStatuses[selectedTicket.id] === 'available' || !ticketStatuses[selectedTicket.id]) && (
                    <span className="pill pill-ok px-2 py-0.5 rounded-full text-[11px] bg-[#E7F0E6] text-[#4B7A50] font-medium">Disponible</span>
                  )}
                </b>
              </div>

              <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                <span className="text-[#6A695C]">Precio</span>
                <b className="font-serif text-[#26261F]">${selectedTicket.price.toLocaleString('es-CO')}</b>
              </div>

              {/* Conditional Data based on status */}
              {ticketStatuses[selectedTicket.id] === 'sold' && (() => {
                const purchaseInfo = purchasesData.find((p: any) => p.ticketId === selectedTicket.id);
                return (
                  <>
                    <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                      <span className="text-[#6A695C]">Comprador</span>
                      <b className="font-serif text-[#26261F] text-right truncate max-w-[170px]">{purchaseInfo?.buyerName || 'Taylor Adam'}</b>
                    </div>
                    <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                      <span className="text-[#6A695C]">Orden</span>
                      <b className="font-serif text-[#26261F] text-right text-[11px] truncate max-w-[170px]">{purchaseInfo?.orderId || 'ORD-QUICK-OASIS-8'}</b>
                    </div>
                    <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                      <span className="text-[#6A695C]">Check-in</span>
                      <b className="font-serif text-[#26261F]">{purchaseInfo && purchaseInfo.accesosRestantes < purchaseInfo.totalAccesos ? 'Hecho' : 'Pendiente'}</b>
                    </div>

                    <div className="pt-3 space-y-2">
                      {onViewPurchase && purchaseInfo?.orderId && (
                        <button
                          type="button"
                          onClick={() => onViewPurchase(purchaseInfo.orderId)}
                          className="btn btn-ghost w-full py-2.5 border border-[#E3DDCD] rounded-lg text-xs font-semibold text-[#26261F] bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          Ver la compra
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleLockAction(selectedTicket.id, 'unlock')}
                        className="btn btn-bronze w-full py-2.5 bg-[#8A6B31] text-white rounded-lg text-xs font-semibold hover:bg-[#775B29] transition-colors cursor-pointer"
                      >
                        {actionLoading ? 'Liberando...' : 'Liberar la mesa'}
                      </button>
                    </div>
                  </>
                );
              })()}

              {ticketStatuses[selectedTicket.id] === 'locked' && (() => {
                const lockInfo = locksData.find((l: any) => l.ticketId === selectedTicket.id);
                return (
                  <>
                    <div className="kv flex justify-between items-center py-2 border-b border-dashed border-[#EFEADC] text-xs">
                      <span className="text-[#6A695C]">Bloqueado por</span>
                      <b className="font-serif text-[#26261F]">{lockInfo?.adminUsername || 'Staff (WPP)'}</b>
                    </div>

                    <div className="pt-3 space-y-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleLockAction(selectedTicket.id, 'unlock')}
                        className="btn btn-bronze w-full py-2.5 bg-[#8A6B31] text-white rounded-lg text-xs font-semibold hover:bg-[#775B29] transition-colors cursor-pointer"
                      >
                        {actionLoading ? 'Liberando...' : 'Liberar la mesa'}
                      </button>
                      {onSelectTicketForSale && (
                        <button
                          type="button"
                          onClick={() => onSelectTicketForSale(selectedTicket.id)}
                          className="btn btn-primary w-full py-2.5 bg-[#5A6046] text-white rounded-lg text-xs font-semibold hover:bg-[#454A34] transition-colors cursor-pointer"
                        >
                          Registrar venta directa
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}

              {(ticketStatuses[selectedTicket.id] === 'available' || !ticketStatuses[selectedTicket.id]) && (
                <div className="pt-3 space-y-2">
                  {onSelectTicketForSale && (
                    <button
                      type="button"
                      onClick={() => onSelectTicketForSale(selectedTicket.id)}
                      className="btn btn-primary w-full py-2.5 bg-[#5A6046] text-white rounded-lg text-xs font-semibold hover:bg-[#454A34] transition-colors cursor-pointer"
                    >
                      Registrar venta directa
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleLockAction(selectedTicket.id, 'lock')}
                    className="btn btn-bronze w-full py-2.5 bg-[#8A6B31] text-white rounded-lg text-xs font-semibold hover:bg-[#775B29] transition-colors cursor-pointer"
                  >
                    {actionLoading ? 'Bloqueando...' : 'Bloquear mesa (WPP)'}
                  </button>
                </div>
              )}

              {statusMessage && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs font-semibold ${
                  statusMessage.type === 'success' ? 'bg-[#E7F0E6] text-[#4B7A50]' : 'bg-[#F8E7E2] text-[#B24A34]'
                }`}>
                  {statusMessage.text}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="card-head border-b border-[#EFEADC] p-4 bg-[#FAF8F5]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#26261F]">Detalles de la mesa</h3>
                <p className="text-xs text-[#6A695C] mt-0.5">Selecciona un punto en el mapa</p>
              </div>
            </div>
            <div className="card-body p-6 text-center text-[#6A695C]">
              <div className="empty py-4">
                <strong className="block text-[#26261F] text-sm mb-1 font-medium">Ninguna mesa seleccionada</strong>
                <p className="text-xs leading-relaxed text-[#6A695C]">
                  Haz clic en cualquier punto del mapa para ver su estado, comprador, o realizar bloqueos y ventas en tiempo real.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
