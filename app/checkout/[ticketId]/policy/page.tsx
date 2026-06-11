'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CountdownTimer from '@/components/checkout/CountdownTimer';
import { tickets } from '@/data/tickets';

const POLICIES = [
  'La edad mínima para ingresar es de 18 años. ¡Un parche pensado solo para adultos!',
  'Las mascotas no están permitidas. Lo sentimos, peluditos...',
  'Cuida tus pertenencias: no nos hacemos responsables por pérdidas o extravíos.',
  'Nos esforzamos por ofrecer un ambiente de calidad y confort, pero no asumimos responsabilidad por daños a objetos personales (ropa, accesorios u otros artículos).',
  'Nuestro hotel es un espacio libre de humo. ¡Recuerda que tenemos techos de paja y tu seguridad es prioridad!',
  'No está permitido el ingreso de alimentos y bebidas externas. ¡No te preocupes, nuestra carta tiene opciones deliciosas!',
  'El uso, posesión o distribución de drogas está estrictamente prohibido. Nos comprometemos a mantener un ambiente seguro y respetuoso.',
];

export default function PolicyPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [accepted, setAccepted] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  const ticket = tickets.find((t) => t.id === ticketId);

  const verifySession = useCallback(async () => {
    const res = await fetch(`/api/checkout/verify?ticketId=${ticketId}`);
    const data = await res.json();
    setSessionValid(data.valid);
    if (data.valid) setRemainingSeconds(data.remainingSeconds);
    if (!data.valid) router.replace('/');
  }, [ticketId, router]);

  useEffect(() => {
    verifySession();
    // Verify buyer info exists — if not, send back to form
    const buyer = sessionStorage.getItem(`checkout_buyer_${ticketId}`);
    if (!buyer) router.replace(`/checkout/${ticketId}`);
  }, [verifySession, ticketId, router]);

  useEffect(() => {
    if (!sessionValid) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) { clearInterval(interval); router.replace('/'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionValid, router]);

  if (sessionValid === null || !ticket) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center px-4 py-8">

      <CountdownTimer seconds={remainingSeconds} ticketName={`${ticket.name} #${ticket.number}`} />

      <div className="w-full max-w-sm bg-white rounded-2xl px-5 py-6 shadow-sm mt-4">

        <h2 className="font-displayFlyer text-[22px] text-[#231E1A] text-center leading-tight mb-1">
          Políticas<br />de reserva
        </h2>
        <div className="h-px bg-[#E8E2DA] my-4" />

        <ol className="flex flex-col gap-3">
          {POLICIES.map((policy, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="font-nunito text-[12px] font-semibold text-[#686A54] flex-shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <p className="font-nunito text-[12px] text-[#5A5248] leading-relaxed">
                {policy}
              </p>
            </li>
          ))}
        </ol>

        <div className="h-px bg-[#E8E2DA] my-4" />

        {/* Accept checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAccepted(!accepted)}
            className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors
              ${accepted ? 'bg-[#686A54] border-[#686A54]' : 'border-[#C4BDB4] bg-white'}`}
          >
            {accepted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p className="font-nunito text-[12px] text-[#5A5248] leading-relaxed">
            Confirmo que soy mayor de 18 años, acepto las políticas de no reembolsos y las normas del evento (sin mascotas, libre de humo/drogas).
          </p>
        </label>

        <button
          onClick={() => accepted && router.push(`/checkout/${ticketId}/payment`)}
          disabled={!accepted}
          className="w-full mt-5 py-3 rounded-xl bg-[#686A54] text-white font-nunito font-semibold text-[13px] uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-90"
        >
          Aceptar y continuar
        </button>
      </div>
    </div>
  );
}