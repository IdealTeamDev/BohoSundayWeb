'use client';

import { useEffect } from 'react';
import EventMap from '@/components/eventmap/EventMap';

interface BottomBarProps {
  openMap: boolean;
  onToggleMap: () => void;
}

export default function BottomBar({ openMap, onToggleMap }: BottomBarProps) {

  // Block body scroll when map is open
  useEffect(() => {
    if (openMap) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [openMap]);

  return (
    <>
      {/* ── Overlay oscuro — solo visible cuando el mapa está abierto ── */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 transition-opacity duration-300"
        style={{
          opacity: openMap ? 1 : 0,
          pointerEvents: openMap ? 'auto' : 'none',
        }}
        onClick={onToggleMap}
      />

      {/* ── Contenedor fijo que incluye mapa + barra de botones ── */}
      <div className="fixed bottom-0 left-0 right-0 z-9999 flex flex-col items-center pointer-events-none">

        {/* Drawer del mapa — sale desde abajo hacia arriba */}
        <div
          className="w-full max-w-lg px-2 pt-12 mb-[-25px] overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 80px)',
            transform: openMap ? 'translateY(0)' : 'translateY(100%)',
            opacity: openMap ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
            pointerEvents: openMap ? 'auto' : 'none',
          }}
        >
          {/* Handle bar para indicar que es un drawer */}
        
          <EventMap onClose={onToggleMap} />
        </div>

        {/* ── Barra de botones — siempre visible ── */}
        <div className="w-full flex justify-center pointer-events-none relative z-10">
          <div
            className="flex flex-row w-full items-center justify-center gap-4
              bg-[#F4EFE9] px-4 py-5
               border-top pointer-events-auto"
          >
            {/* MAPA DE MESAS */}
            <button
              onClick={onToggleMap}
              className="text-[14px] font-semibold font-nunito py-2.5 px-4 rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: openMap ? '#47311F' : '#686A54',
                color: '#F4EFE9',
              }}
            >
              MAPA DE MESAS
            </button>

            {/* BOLETERÍA INDIVIDUAL */}
            <button
              className="text-[14px] font-semibold font-nunito py-2.5 px-4 rounded-lg"
              style={{ backgroundColor: '#686A54', color: '#F4EFE9' }}
            >
              BOLETERÍA INDIVIDUAL
            </button>
          </div>
        </div>

      </div>
    </>
  );
}