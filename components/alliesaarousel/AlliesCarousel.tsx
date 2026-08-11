'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';

const allies = [
  { id: 1, name: 'Ubari', logo: '/images/allies/logo-ubari2.png' },
  { id: 2, name: '3NomadsX', logo: '/images/allies/Group.png' },
  { id: 3, name: 'Salón Amador', logo: '/images/allies/logo-salon-amador.png' },
  { id: 4, name: 'Don Julio', logo: '/images/allies/Group 1.png' },
];

// Dots always show 3 — maps current index to one of 3 dot positions
function getDotIndex(current: number, total: number): number {
  return current % 3;
}

export default function AlliesCarousel() {
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = allies.length;

  function goTo(next: number, dir: 'left' | 'right') {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent((next + total) % total);
      setAnimating(false);
    }, 280);
  }

  function next() {
    goTo(current + 1, 'right');
  }

  function prev() {
    goTo(current - 1, 'left');
  }

  useEffect(() => {
    if (animating) return;
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % allies.length);
    }, 3500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [animating]);

  const ally = allies[current % allies.length];
  const dotIndex = getDotIndex(current, total);

  return (
    <div className="w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 py-6">

      {/* ── MOBILE: Carousel Slider (hidden on lg+) ── */}
      <div className="block lg:hidden relative rounded-xl overflow-hidden bg-[#EDE8E0] py-4">
        {/* Titulo */}
        <div className="text-center mt-2">
          <p className="font-averia text-[#231E1A] text-[15px] font-bold uppercase tracking-widest">
            {t.allies.title}
          </p>
        </div>
        
        {/* Prev button */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-[#231E1A] hover:text-black transition-colors"
          aria-label="Anterior aliado"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Logos */}
        <div
          className="flex items-center justify-center py-6 px-16 min-h-[140px]"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === 'right' ? '-12px' : '12px'})`
              : 'translateX(0)',
            transition: animating
              ? 'opacity 0.15s ease, transform 0.15s ease'
              : 'opacity 0.15s ease, transform 0.15s ease',
          }}
        >
          <img
            src={ally.logo}
            alt={ally.name}
            className="max-h-16 max-w-[200px] w-auto h-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const fallback = e.currentTarget.nextSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-[#231E1A] hover:text-black transition-colors"
          aria-label="Siguiente aliado"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots — always 3 */}
        <div className="flex items-center justify-center gap-2.5 pb-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="rounded-full transition-all duration-300"
              style={{
                width: dot === dotIndex ? '8px' : '6px',
                height: dot === dotIndex ? '8px' : '6px',
                background: dot === dotIndex ? '#231E1A' : '#C1BBAF',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: All Allies in a row (hidden on mobile/tablet) ── */}
      <div className="hidden lg:block rounded-2xl overflow-hidden bg-[#EDE8E0] py-6 px-10">
        {/* Titulo */}
        <div className="text-center mb-6 select-none">
          <p className="font-averia text-[#231E1A] text-[15px] font-bold uppercase tracking-widest">
            {t.allies.title}
          </p>
        </div>
        {/* Logos Row */}
        <div className="flex flex-row items-center justify-around gap-10">
          {allies.map((a) => (
            <div key={a.id} className="flex items-center justify-center h-20 w-1/4">
              <img
                src={a.logo}
                alt={a.name}
                className="max-h-14 max-w-full w-auto h-auto object-contain opacity-95 hover:opacity-100 transition-opacity duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fallback = e.currentTarget.nextSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}