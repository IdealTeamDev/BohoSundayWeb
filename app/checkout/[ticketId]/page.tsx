'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets } from '@/data/tickets';
import type { BuyerInfo } from '@/types/checkout';
import CountdownTimer from '@/components/checkout/CountdownTimer';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [form, setForm] = useState<BuyerInfo & { confirmEmail: string }>({
    name: '',
    phone: '',
    email: '',
    confirmEmail: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
  }, [verifySession]);

  // Countdown tick
  useEffect(() => {
    if (!sessionValid) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          router.replace('/');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionValid, router]);

  function validate() {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = 'Ingresa tu nombre completo';
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Número inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Correo inválido';
    if (form.email !== form.confirmEmail)
      newErrors.confirmEmail = 'Los correos no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !acceptedTerms) return;
    setLoading(true);

    // Save buyer info in sessionStorage to pass between pages
    sessionStorage.setItem(`checkout_buyer_${ticketId}`, JSON.stringify({
      name: form.name,
      phone: form.phone,
      email: form.email,
    }));

    router.push(`/checkout/${ticketId}/payment`);
  }

  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) return null;

  const formattedPrice = new Intl.NumberFormat('es-CO').format(ticket.price);

  return (
    <div className="w-full bg-[#F4EFE9] flex flex-col items-center">

      {/* Timer banner */}
      <CountdownTimer seconds={remainingSeconds} ticketName={`${ticket.name} #${ticket.number}`} />

      {/* Card */}
      <div className="w-full bg-[#F4EFE9] overflow-hidden shadow-sm">

        {/* Ticket image 
        {ticket.img && (
          <div className="w-full h-36 overflow-hidden">
            <img
              src={`/${ticket.img}`}
              alt={ticket.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}*/}

        <div className="px-5 py-4">
          <div>
            {/* Ticket name */}
            <h2 className="font-displayFlyer text-center pb-6 pt-4 text-4xl uppercase tracking-wider text-[#231E1A]">
              {ticket.name} #{ticket.number}
            </h2>
            <img
              src={ticket.iconCard}
              alt="Boho Sunday Colombia Moda Edition"
              width={10}
              height={20}
            />
          </div>

          {/* Ticket name 
          <p className="font-nunito text-[13px] text-[#686A54] mb-4">
            {ticket.persons} personas · ${formattedPrice} COP
          </p>*/}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Field
              label="Nombres y Apellidos"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              error={errors.name}
              placeholder="Ingresa tu nomnbre y apellido"
              type="text"
            />
            <Field
              label="WhastApp"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
              placeholder="Ingresa tu número de WhatsApp"
              type="tel"
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
              placeholder="tu@correo.com"
              type="email"
            />
            <Field
              label="Confirmar Email"
              value={form.confirmEmail}
              onChange={(v) => setForm({ ...form, confirmEmail: v })}
              error={errors.confirmEmail}
              placeholder="Repite tu correo"
              type="email"
              noPaste
            />
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 mt-7 mb-2 cursor-pointer select-none group" id="terms-label">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border flex items-center justify-center transition-all duration-200
                ${acceptedTerms ? 'bg-[#686A54] border-[#686A54]' : 'border-[#C4BDB4] bg-white group-hover:border-[#686A54]'}`}
            >
              {acceptedTerms && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className="font-nunito text-[15px] text-[#231E1A] leading-relaxed">
              Confirmo que soy mayor de 18 años, acepto las políticas de no reembolso y las normas del evento (sin mascotas, libre de humo/drogas).
            </p>
          </label>
          <a href='' className="text-[#47311F] font-nunito text-[15px] underline">Leer reglas completas</a>

          <button
            onClick={handleSubmit}
            disabled={loading || !acceptedTerms}
            className="w-full mt-8 mb-6 py-3 rounded-xl bg-[#686A54] text-white text-[17px] font-semibold font-nunito uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'FINALIZAR COMPRA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field component ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  noPaste?: boolean;
}

function Field({ label, value, onChange, error, placeholder, type = 'text', noPaste }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-nunito text-[18px] text-[#231E1A]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={noPaste ? (e) => e.preventDefault() : undefined}
        placeholder={placeholder}
        className={`w-full px-3 py-3 rounded-xl font-light font-nunito text-[15px] text-[#231E1A] placeholder:text-[#BDB39B] bg-[#D9D1C0] outline-none transition-colors
          ${error ? 'border-red-400 focus:border-red-500' : 'border-[#686A54] focus:border-[#5C9D41]'}`}
      />
      {error && (
        <span className="font-nunito text-[13px] text-red-500">{error}</span>
      )}
    </div>
  );
}