'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets } from '@/data/tickets';
import { zoneConfig } from '@/data/zoneConfig';
import type { BuyerInfo } from '@/types/checkout';
import CountdownTimer from '@/components/checkout/CountdownTimer';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [form, setForm] = useState<BuyerInfo & { confirmEmail: string; docType: string; docNumber: string; phonePrefix: string }>({
    name: '',
    phone: '',
    email: '',
    confirmEmail: '',
    docType: 'C.C',
    docNumber: '',
    phonePrefix: '+57',
  });
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'mercadopago' | ''>('');
  const [errors, setErrors] = useState<Partial<typeof form & { paymentMethod: string }>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const ticket = tickets.find((t) => t.id === ticketId);

  const verifySession = useCallback(async () => {
    const res = await fetch(`/api/checkout/verify?ticketId=${ticketId}`);
    const data = await res.json();
    setSessionValid(data.valid);
    if (data.valid) {
      setRemainingSeconds(data.remainingSeconds);
      if (typeof data.quantity === 'number') {
        setQuantity(data.quantity);
      }
    }
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
    const newErrors: Partial<typeof form & { paymentMethod: string }> = {};
    if (!form.name.trim()) newErrors.name = 'Ingresa tu nombre completo';
    if (!form.docNumber.trim()) newErrors.docNumber = 'Ingresa tu identificación';
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Número inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Correo inválido';
    if (form.email !== form.confirmEmail)
      newErrors.confirmEmail = 'Los correos no coinciden';
    if (!paymentMethod)
      newErrors.paymentMethod = 'Selecciona un método de pago';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !acceptedTerms) return;
    setLoading(true);
    setSubmitError(null);

    const buyerInfo = {
      name: form.name,
      phone: `${form.phonePrefix} ${form.phone}`,
      email: form.email,
      docType: form.docType,
      docNumber: form.docNumber,
    };

    try {
      const res = await fetch('/api/checkout/payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          buyerInfo,
          quantity,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Error al iniciar la sesión de pago.');
        setLoading(false);
        return;
      }

      // Save info in sessionStorage as fallback
      sessionStorage.setItem(`checkout_buyer_${ticketId}`, JSON.stringify(buyerInfo));
      sessionStorage.setItem(`checkout_quantity_${ticketId}`, quantity.toString());
      sessionStorage.setItem(`checkout_order_${ticketId}`, data.orderId);

      // Redirect to checkout provider (Mercado Pago or Wompi Mock)
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Error submitting payment session:', err);
      setSubmitError('Error de red. Por favor intenta de nuevo.');
      setLoading(false);
    }
  }

  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) return null;

  const totalPrice = ticket.stock !== undefined ? ticket.price * quantity : ticket.price;
  const formattedPrice = new Intl.NumberFormat('es-CO').format(totalPrice);

  const iconSrc = ticket.iconCard
    ? (ticket.iconCard.startsWith('/') ? ticket.iconCard : `/${ticket.iconCard}`)
    : `/${zoneConfig[ticket.zone].icon}`;

  return (
    <div className="w-full bg-[#F4EFE9] flex flex-col items-center">

      {/* Timer banner */}
      <CountdownTimer seconds={remainingSeconds} ticketName={`${ticket.name}${ticket.stock === undefined ? ` #${ticket.number}` : ''}`} />

      {/* Card */}
      <div className="w-full lg:max-w-3xl bg-[#F4EFE9] overflow-hidden lg:shadow-none shadow-sm">

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
          {/* Title with Icon */}
          <div className="flex justify-center items-center gap-3 pb-6 pt-4">
            <img
              src={iconSrc}
              alt="Boho Sunday Colombia Moda Edition"
              width={28}
              height={44}
              className="object-contain"
            />
            <h2 className="font-displayFlyer text-3xl uppercase tracking-wider text-[#231E1A]">
              {ticket.name}{ticket.stock === undefined ? ` #${ticket.number}` : ''}
            </h2>
          </div>

          {ticket.stock !== undefined && (
            <p className="font-nunito text-[15px] text-center text-[#686A54] mb-6">
              {quantity} {quantity === 1 ? 'boleta' : 'boletas'} · ${formattedPrice} COP
            </p>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Field
              label="Nombres y Apellidos"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              error={errors.name}
              placeholder="Ingresa tu nombre y apellido"
              type="text"
            />
            <DropdownField
              label="Documento de Identificación"
              value={form.docNumber}
              onChange={(v) => setForm({ ...form, docNumber: v })}
              error={errors.docNumber}
              placeholder="Ingresa tu identificación"
              dropdownValue={form.docType}
              onDropdownChange={(v) => setForm({ ...form, docType: v })}
              dropdownOptions={[
                { display: 'C.C', label: 'C.C (Cédula de Ciudadanía)', value: 'C.C' },
                { display: 'C.E', label: 'C.E (Cédula de Extranjería)', value: 'C.E' },
                { display: 'PASAPORTE', label: 'PASAPORTE', value: 'PASAPORTE' },
              ]}
              type="text"
            />
            <DropdownField
              label="WhatsApp"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
              placeholder="Ingresa tu número de WhatsApp"
              dropdownValue={form.phonePrefix}
              onDropdownChange={(v) => setForm({ ...form, phonePrefix: v })}
              dropdownOptions={[
                { display: '🇨🇴', label: '🇨🇴 (+57)', value: '+57' },
                { display: '🇺🇸', label: '🇺🇸 (+1)', value: '+1' },
                { display: '🇪🇸', label: '🇪🇸 (+34)', value: '+34' },
                { display: '🇲🇽', label: '🇲🇽 (+52)', value: '+52' },
                { display: '🇵🇦', label: '🇵🇦 (+507)', value: '+507' },
                { display: '🇻🇪', label: '🇻🇪 (+58)', value: '+58' },
                { display: '🇪🇨', label: '🇪🇨 (+593)', value: '+593' },
                { display: '🇵🇪', label: '🇵🇪 (+51)', value: '+51' },
              ]}
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
            <PaymentMethodSelector
              selected={paymentMethod}
              onChange={(v) => setPaymentMethod(v)}
              error={errors.paymentMethod}
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

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4 text-center">
              <p className="font-nunito text-[14px] text-red-600">{submitError}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !acceptedTerms}
            className="w-full mt-8 mb-6 py-3 rounded-lg bg-[#686A54] text-white text-[15px] font-semibold font-nunito uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Redirigiendo...' : 'FINALIZAR COMPRA'}
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
        className={`w-full px-3 py-3 rounded-xl font-light font-nunito text-[15px] text-[#231E1A] placeholder:text-[#BDB39B] bg-[#D9D1C0] outline-none transition-colors border
          ${error ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-[#5C9D41]'}`}
      />
      {error && (
        <span className="font-nunito text-[13px] text-red-500">{error}</span>
      )}
    </div>
  );
}

// ── DropdownField component ──────────────────────────────────────────────────
interface DropdownOption {
  display: string;
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  dropdownValue: string;
  onDropdownChange: (v: string) => void;
  dropdownOptions: DropdownOption[];
  type?: string;
}

function DropdownField({
  label,
  value,
  onChange,
  error,
  placeholder,
  dropdownValue,
  onDropdownChange,
  dropdownOptions,
  type = 'text',
}: DropdownFieldProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!open) return;
    const clickHandler = () => setOpen(false);
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [open]);

  const selectedOption = dropdownOptions.find((opt) => opt.value === dropdownValue) || dropdownOptions[0];

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="font-nunito text-[18px] text-[#231E1A]">
        {label}
      </label>
      <div
        className={`w-full flex items-center px-3 rounded-xl bg-[#D9D1C0] transition-colors relative border
          ${error 
            ? 'border-red-400' 
            : focused 
              ? 'border-[#5C9D41]' 
              : 'border-transparent'
          }`}
      >
        {/* Dropdown Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="flex items-center gap-1.5 py-3 text-[#231E1A] font-nunito font-light text-[15px] focus:outline-none cursor-pointer"
          >
            <span>{selectedOption.display}</span>
            <svg
              className={`w-2 h-1.5 text-[#7A6F5E] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 10 6"
            >
              <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown Options Menu */}
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-[#F4EFE9] border border-[#BDB39B] rounded-xl shadow-lg z-50 overflow-hidden min-w-[150px]">
              {dropdownOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onDropdownChange(opt.value);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 hover:bg-[#D9D1C0]/60 text-left font-nunito text-[14px] text-[#231E1A] transition-colors cursor-pointer block"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-[#BDB39B]/80 mx-3 flex-shrink-0" />

        {/* Input Field */}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 bg-transparent outline-none font-light font-nunito text-[15px] text-[#231E1A] placeholder:text-[#BDB39B]"
        />
      </div>
      {error && (
        <span className="font-nunito text-[13px] text-red-500">{error}</span>
      )}
    </div>
  );
}