'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';
import EventMap from '@/components/eventmap/EventMap';
import IndividualTickets from '@/components/individual/IndividualTickets';

interface BottomBarProps {
  openMap: boolean;
  onToggleMap: () => void;
}

export default function BottomBar({ openMap, onToggleMap }: BottomBarProps) {
  const [openIndividual, setOpenIndividual] = useState(false);
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  // Block body scroll when map or individual tickets are open
  useEffect(() => {
    if (openMap || openIndividual) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [openMap, openIndividual]);

  return (
    <>
      {/* ── Overlay oscuro — solo visible cuando el mapa o individual está abierto ── */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 transition-opacity duration-300"
        style={{
          opacity: openMap || openIndividual ? 1 : 0,
          pointerEvents: openMap || openIndividual ? 'auto' : 'none',
        }}
        onClick={() => {
          if (openMap) onToggleMap();
          if (openIndividual) setOpenIndividual(false);
        }}
      />
      {/* ── Contenedor fijo que incluye mapa + barra de botones ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col items-center pointer-events-none">

        {/* Drawer del mapa e individual — sale desde abajo hacia arriba */}
        <div
          className="w-full px-2 sm:px-4 pt-8 pb-1 mb-1.5 sm:mb-2 flex flex-col items-center overflow-visible"
          style={{
            maxWidth: openMap
              ? 'min(40rem, max(19rem, calc((100dvh - 170px) * 0.98)))'
              : 'min(52rem, calc(100vw - 1rem))',
            maxHeight: 'calc(100dvh - 75px)',
            transform: (openMap || openIndividual) ? 'translateY(0)' : 'translateY(100%)',
            opacity: (openMap || openIndividual) ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
            pointerEvents: (openMap || openIndividual) ? 'auto' : 'none',
          }}
        >
          {openMap && <EventMap onClose={onToggleMap} />}
          {openIndividual && <IndividualTickets onClose={() => setOpenIndividual(false)} />}
        </div>

        {/* ── Barra de botones — siempre visible ── */}
        <div className="w-full flex justify-center pointer-events-none relative z-10">
          <div
            className="flex flex-row w-full items-center justify-center gap-4
              bg-[#F4EFE9] px-4 py-3 sm:py-4
              border-t border-[#BDB39B]/30 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            {/* MAPA DE MESAS */}
            <button
              onClick={() => {
                onToggleMap();
                if (openIndividual) setOpenIndividual(false);
              }}
              className="text-[14px] font-semibold font-nunito py-2.5 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
              style={{
                backgroundColor: openMap ? '#A94A34' : '#A94A34',
                color: '#F4EFE9',
              }}
            >
              {t.bottomBar.map}
            </button>

            {/* BOLETERÍA INDIVIDUAL */}
            <button
              onClick={() => {
                setOpenIndividual(!openIndividual);
                if (openMap) onToggleMap();
              }}
              className="text-[14px] font-semibold font-nunito py-2.5 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
              style={{
                backgroundColor: openIndividual ? '#F7963F' : '#F7963F',
                color: '#231E1A',
              }}            >
              {t.bottomBar.individual}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}