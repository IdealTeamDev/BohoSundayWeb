'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tickets } from '@/data/tickets';
import { zoneConfig } from '@/data/zoneConfig';
import type { BuyerInfo } from '@/types/checkout';
import { translations } from '@/data/translations';
import CountdownTimer from '@/components/checkout/CountdownTimer';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import MPCardBrick from '@/components/checkout/MPCardBrick';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

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
  const [checkoutOrderId, setCheckoutOrderId] = useState<string>('');
  const [showMPBrick, setShowMPBrick] = useState<boolean>(false);

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
    if (!data.valid) router.replace(locale === 'en' ? '/en' : '/');
  }, [ticketId, router, locale]);

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
          router.replace(locale === 'en' ? '/en' : '/');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionValid, router, locale]);

  function validate() {
    const newErrors: Partial<typeof form & { paymentMethod: string }> = {};
    if (!form.name.trim()) newErrors.name = t.checkout.errorEmptyName;
    if (!form.docNumber.trim()) newErrors.docNumber = t.checkout.errorEmptyDoc;
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = t.checkout.errorInvalidPhone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t.checkout.errorInvalidEmail;
    if (form.email !== form.confirmEmail)
      newErrors.confirmEmail = t.checkout.errorMismatchEmail;
    if (!paymentMethod)
      newErrors.paymentMethod = t.checkout.errorEmptyPayment;
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
      locale,
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
        setSubmitError(data.error || t.checkout.submitErrorDefault);
        setLoading(false);
        return;
      }

      // If Mercado Pago expects Card Bricks processing
      if (data.useBricks) {
        setCheckoutOrderId(data.orderId);
        setShowMPBrick(true);
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
      setSubmitError(t.checkout.networkError);
      setLoading(false);
    }
  }

  const handleBrickSubmit = useCallback(async (param: any) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: checkoutOrderId,
          ticketId: ticketId,
          formData: param.formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setSubmitError(data.error || 'El pago fue rechazado. Intenta con otra tarjeta.');
        setLoading(false);
        setShowMPBrick(false);
        return;
      }

      const buyerInfo = {
        name: form.name,
        phone: `${form.phonePrefix} ${form.phone}`,
        email: form.email,
        docType: form.docType,
        docNumber: form.docNumber,
        locale,
      };

      // Save info in sessionStorage as fallback
      sessionStorage.setItem(`checkout_buyer_${ticketId}`, JSON.stringify(buyerInfo));
      sessionStorage.setItem(`checkout_quantity_${ticketId}`, quantity.toString());
      sessionStorage.setItem(`checkout_order_${ticketId}`, checkoutOrderId);

      // Handle redirect for bank transfer (PSE) or ticket cash payment (Efecty)
      if (data.status === 'pending' && data.externalResourceUrl) {
        window.location.href = data.externalResourceUrl;
        return;
      }

      // Redirect to success screen (Credit/Debit Card approved)
      router.push(`/checkout/${ticketId}/success?orderId=${checkoutOrderId}`);
    } catch (err) {
      console.error('Error submitting brick payment:', err);
      setSubmitError('Error de conexión al procesar el pago.');
      setLoading(false);
      setShowMPBrick(false);
    }
  }, [checkoutOrderId, ticketId, form, quantity, locale, router]);

  if (sessionValid === null) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket || ticket.disabled) return null;

  const ticketKey = (ticket.id === 'early' || ticket.id === 'anytime') ? ticket.id : ticket.zone;
  const tTicket = t.tickets[ticketKey as keyof typeof t.tickets] as { name: string; description: string; licor: string };

  const totalPrice = ticket.stock !== undefined ? ticket.price * quantity : ticket.price;
  const formattedPrice = new Intl.NumberFormat('es-CO').format(totalPrice);

  const iconSrc = ticket.iconCard
    ? (ticket.iconCard.startsWith('/') ? ticket.iconCard : `/${ticket.iconCard}`)
    : `/${zoneConfig[ticket.zone].icon}`;

  return (
    <div className="w-full bg-[#F4EFE9] flex flex-col items-center">

      {/* Timer banner */}
      <CountdownTimer seconds={remainingSeconds} ticketName={`${tTicket.name}${ticket.stock === undefined ? ` #${ticket.number}` : ''}`} />

      {/* Card */}
      <div className="w-full lg:max-w-3xl bg-[#F4EFE9] overflow-hidden lg:shadow-none shadow-sm">

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
              {tTicket.name}{ticket.stock === undefined ? ` #${ticket.number}` : ''}
            </h2>
          </div>

          {ticket.stock !== undefined && (
            <p className="font-nunito text-[15px] text-center text-[#686A54] mb-6">
              {quantity} {quantity === 1 ? t.checkout.ticketQty_one : t.checkout.ticketQty_other} · ${formattedPrice} COP
            </p>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Field
              label={t.checkout.nameLabel}
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              error={errors.name}
              placeholder={t.checkout.namePlaceholder}
              type="text"
            />
            <DropdownField
              label={t.checkout.docLabel}
              value={form.docNumber}
              onChange={(v) => setForm({ ...form, docNumber: v })}
              error={errors.docNumber}
              placeholder={t.checkout.docPlaceholder}
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
              label={t.checkout.whatsappLabel}
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
              placeholder={t.checkout.whatsappPlaceholder}
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
              label={t.checkout.emailLabel}
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
              placeholder={t.checkout.emailPlaceholder}
              type="email"
            />
            <Field
              label={t.checkout.confirmEmailLabel}
              value={form.confirmEmail}
              onChange={(v) => setForm({ ...form, confirmEmail: v })}
              error={errors.confirmEmail}
              placeholder={t.checkout.confirmEmailPlaceholder}
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
              {t.checkout.termsConfirm}
            </p>
          </label>
          <a href={locale === 'en' ? '/en/policy' : '/policy'} target="_blank" rel="noopener noreferrer" className="text-[#47311F] font-nunito text-[15px] underline">{t.checkout.readTerms}</a>

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
            {loading ? t.checkout.loading : t.checkout.finishButton}
          </button>
        </div>
      </div>

      {/* Mercado Pago Bricks Modal Overlay */}
      {showMPBrick && ticket && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE9] rounded-2xl p-6 w-full max-w-md shadow-lg border border-[#BDB39B]/30 relative flex flex-col items-center">
            <button
              onClick={() => setShowMPBrick(false)}
              className="absolute top-4 right-4 text-[#231E1A] hover:opacity-60 transition-opacity font-semibold w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center cursor-pointer"
              aria-label="Cerrar"
            >
              ✕
            </button>
            
            <img
              src="/images/icon/icons-tickets.png"
              alt="Secure Payment"
              width={26}
              className="object-contain mb-3"
            />
            
            <h3 className="font-displayFlyer text-center text-2xl uppercase text-[#231E1A] mb-5 tracking-wide">
              {locale === 'en' ? 'Card Payment' : 'Pago con Tarjeta'}
            </h3>
            
            <div className="w-full max-h-[80vh] overflow-y-auto">
              <MPCardBrick
                amount={ticket.stock !== undefined ? ticket.price * quantity : ticket.price}
                locale={locale}
                onSubmit={handleBrickSubmit}
              />
            </div>
          </div>
        </div>
      )}
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