'use client';

import { useState } from 'react';

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

  function toggle(id: number) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="w-full px-4 pt-1 pb-10">

      {/* Title */}
      <div className="text-center mb-6">
        <p className="font-nunito text-[18px] uppercase  text-[#000000]">
          Conoce el
        </p>
        <h2 className="font-displayFlyer text-[34px] text-[#000000] leading-tight">
          Line Up
        </h2>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-2">
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
              {/* Background photo */}
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: `url(${dj.photo})`,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                  backgroundColor: '#3D3529',
                }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isActive
                    ? 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%)'
                    : 'rgba(0,0,0,0.45)',
                  transition: 'background 0.4s ease',
                }}
              />

              {/* Name */}
              <div
                className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                style={{
                  bottom: isActive ? '17px' : 'auto',
                  top: isActive ? 'auto' : '50%',
                  transform: isActive ? 'none' : 'translateY(-50%)',
                  transition: 'top 0.4s ease, bottom 0.4s ease, transform 0.4s ease',
                }}
              >
                <span
                  className="font-nunito font-extralight uppercase tracking-[0.15em] text-white"
                  style={{
                    fontSize: isActive ? '17px' : '17px',
                    textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {dj.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}