'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { translations } from '@/data/translations';

interface CountdownTimerProps {
  seconds: number;
  ticketName: string;
  ticketId?: string;
}

export default function CountdownTimer({ seconds, ticketName, ticketId }: CountdownTimerProps) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  const [showExitModal, setShowExitModal] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 120; // red under 2 min

  const isTable = !ticketName.toLowerCase().includes('early') && !ticketName.toLowerCase().includes('anytime');
  const securedText = isTable ? t.checkout.securedTable : t.checkout.securedTicket;

  const handleConfirmExit = async () => {
    setIsReleasing(true);
    try {
      if (ticketId) {
        await fetch('/api/checkout/lock', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId }),
        });
      }
    } catch (err) {
      console.error('[CountdownTimer] Error releasing lock:', err);
    } finally {
      router.replace(locale === 'en' ? '/en' : '/');
    }
  };

  return (
    <>
      <div
        className={`w-full px-4 py-6 sm:py-8 relative flex flex-col sm:flex-row items-center justify-between sm:justify-center gap-3 sm:gap-0
          ${isUrgent ? 'bg-red-50' : 'bg-[#EBCB9D]'}`}
      >
        {/* Left: Volver al inicio button */}
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="sm:absolute sm:left-6 lg:left-10 flex items-center gap-2 text-xs lg:text-sm font-nunito font-semibold text-[#CF6E19] hover:text-[#231E1A] transition-colors py-1.5 px-3 rounded-lg hover:bg-black/5"
          aria-label={t.checkout.backToHome || 'Volver al inicio'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t.checkout.backToHome || 'Volver al inicio'}</span>
        </button>

        {/* Center: Timer details */}
        <div className="text-center">
          <p className={`font-nunito font-bold text-[16px] sm:text-[18px] uppercase tracking-wider
            ${isUrgent ? 'text-red-500' : 'text-[#CF6E19]'}`}>
            {isUrgent ? t.checkout.hurryUp : securedText}
          </p>
          <p className="font-nunito font-bold text-[16px] sm:text-[18px] text-[#CF6E19]">
            {t.checkout.completePayment} {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F4EFE9] border border-[#D9D1C0] rounded-2xl max-w-md w-full p-6 lg:p-8 shadow-2xl text-center space-y-5 animate-scale-up">
            {/* Warning Icon */}
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EBCB9D]/40 text-[#CF6E19] flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="font-nunito text-xl lg:text-2xl font-bold uppercase text-[#231E1A] tracking-wide">
              {t.checkout.exitModalTitle || '¿Salir del proceso de compra?'}
            </h3>

            {/* Message */}
            <p className="font-nunito text-sm lg:text-base text-[#686A54] leading-relaxed">
              {t.checkout.exitModalMessage || 'Si sales ahora, tu reserva quedará desbloqueada y estará disponible para otros usuarios.'}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#231E1A] text-[#231E1A] font-nunito font-semibold text-sm hover:bg-[#231E1A] hover:text-[#F4EFE9] transition-all"
              >
                {t.checkout.exitModalCancel || 'Cancelar'}
              </button>

              <button
                type="button"
                disabled={isReleasing}
                onClick={handleConfirmExit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#B24A34] text-white font-nunito font-semibold text-sm hover:bg-[#8F3B29] transition-all shadow-md disabled:opacity-50"
              >
                {isReleasing
                  ? (locale === 'en' ? 'Saliendo...' : 'Saliendo...')
                  : (t.checkout.exitModalConfirm || 'Aceptar / Salir')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}