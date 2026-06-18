'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface IndividualTicketsProps {
  onClose: () => void;
}

export default function IndividualTickets({ onClose }: IndividualTicketsProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleReserve(id: string) {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const res = await fetch('/api/checkout/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Esta boleta no está disponible en este momento. Intenta en unos minutos.');
        return;
      }

      router.push(`/checkout/${id}`);
    } catch (error) {
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoadingId(null);
    }
  }

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
      <h2 className="font-displayFlyer text-center text-4xl uppercase  text-[#231E1A] mt-3 mb-8">
        GENERAL
      </h2>

      {/* Tickets List */}
      <div className="w-full flex flex-col gap-5 max-w-sm">
        
        {/* ENTRADA EARLY */}
        <button
          onClick={() => handleReserve('early')}
          disabled={loadingId !== null}
          className="w-full h-36 rounded-2xl overflow-hidden shadow-md relative hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-[#BDB39B]/30"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("images/individual-ticket/early.png")',
            backgroundColor: '#4E4F44', // Fallback color
          }}
        >
          {loadingId === 'early' ? (
            <div className="absolute inset-0 flex items-center justify-center ">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="font-nunito font-light text-[14px] uppercase  text-white/80 transition-colors group-hover:text-white">
                ENTRADA
              </span>
              <span className="font-displayFlyer text-4xl uppercase text-[#F4EFE9] mt-0.5 transition-transform group-hover:scale-105 duration-300">
                EARLY
              </span>
            </div>
          )}
        </button>

        {/* ENTRADA ANYTIME */}
        <button
          onClick={() => handleReserve('anytime')}
          disabled={loadingId !== null}
          className="w-full h-36 rounded-2xl overflow-hidden shadow-md relative hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group cursor-pointer border border-[#BDB39B]/30"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("images/individual-ticket/anytime.png")',
            backgroundColor: '#45463C', // Fallback color
          }}
        >
          {loadingId === 'anytime' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="font-nunito font-light text-[14px] uppercase  text-white/80 transition-colors group-hover:text-white">
                ENTRADA
              </span>
              <span className="font-displayFlyer text-4xl uppercase  text-[#F4EFE9] mt-0.5 transition-transform group-hover:scale-105 duration-300">
                ANYTIME
              </span>
            </div>
          )}
        </button>

      </div>
    </div>
  );
}
