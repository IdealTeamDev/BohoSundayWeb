'use client';
 
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';
 
const djs = [
  { id: 1, name: 'ANTDOT',       photo: '/images/lineup/ANTIDOT.png' },
  { id: 2, name: '2 NOMADS',     photo: '/images/lineup/NOMADS.png' },
  { id: 3, name: 'ROLAND CLARK', photo: '/images/lineup/ROLAND.png' },
  { id: 4, name: 'NICOLAII',     photo: '/images/lineup/NICOLA.png' },
  { id: 5, name: 'KUBHA',        photo: '/images/lineup/KUBHA.png' },
  { id: 6, name: 'AMOSER',       photo: '/images/lineup/AMOSER.png' },
];
 
export default function LineUp() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;
 
  function toggle(id: number) {
    setActiveId((prev) => (prev === id ? null : id));
  }
 
  return (
    <div className="w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 pt-1 pb-10">
 
      {/* Title */}
      <div className="text-center mb-6">
        <p className="font-nunito text-[18px] uppercase text-[#000000]">
          {t.lineup.title}
        </p>
        <p className="font-displayFlyer text-[34px] text-[#000000] leading-tight">
          Line Up
        </p>
      </div>
 
      {/* ── MÓVIL: acordeón vertical (oculto en lg+) ── */}
      <div className="flex flex-col gap-2 lg:hidden">
        {djs.map((dj) => {
          const isActive = activeId === dj.id;
          return (
            <div
              key={dj.id}
              onClick={() => toggle(dj.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggle(dj.id)}
              className="relative w-full rounded-xl overflow-hidden cursor-pointer select-none"
              style={{
                height: isActive ? '220px' : '56px',
                transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <DjBackground dj={dj} isActive={isActive} />
              <DjOverlay isActive={isActive} />
              <DjLabel name={dj.name} isActive={isActive} />
            </div>
          );
        })}
      </div>
 
      {/* ── DESKTOP: acordeón horizontal de 6 columnas (oculto en móvil) ── */}
      <div className="hidden lg:flex lg:flex-row lg:gap-3 lg:h-[390px]">
        {djs.map((dj) => {
          const isActive = activeId === dj.id;
          return (
            <div
              key={dj.id}
              onClick={() => toggle(dj.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggle(dj.id)}
              className="relative h-full rounded-xl overflow-hidden cursor-pointer select-none"
              style={{
                flexGrow: isActive ? 3 : 1,
                flexBasis: 0,
                transition: 'flex-grow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <DjBackground dj={dj} isActive={isActive} />
              <DjOverlay isActive={isActive} />
              <DjLabel name={dj.name} isActive={isActive} isDesktop={true} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
// ── Subcomponentes compartidos ──────────────────────────────────────────
 
function DjBackground({ dj, isActive }: { dj: { photo: string }; isActive: boolean }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center pointer-events-none"
      style={{
        backgroundImage: `url(${dj.photo})`,
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.4s ease',
        backgroundColor: '#3D3529',
      }}
    />
  );
}
 
function DjOverlay({ isActive }: { isActive: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: isActive
          ? 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%)'
          : 'rgba(0,0,0,0.45)',
        transition: 'background 0.4s ease',
      }}
    />
  );
}
 
function DjLabel({ name, isActive, isDesktop }: { name: string; isActive: boolean; isDesktop?: boolean }) {
  const showLabel = !isDesktop || isActive;

  return (
    <div
      className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
      style={{
        bottom: isActive ? '17px' : 'auto',
        top: isActive ? 'auto' : '50%',
        transform: isActive ? 'none' : 'translateY(-50%)',
        opacity: showLabel ? 1 : 0,
        transition: 'top 0.4s ease, bottom 0.4s ease, transform 0.4s ease, opacity 0.4s ease',
      }}
    >
      <span
        className="font-nunito font-extralight uppercase tracking-[0.15em] text-white text-center px-2"
        style={{
          fontSize: '17px',
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}
      >
        {name}
      </span>
    </div>
  );
}
 










