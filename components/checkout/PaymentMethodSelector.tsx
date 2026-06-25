import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';

export interface PaymentMethodOption {
  id: 'wompi' | 'mercadopago';
  name: string;
  logo: React.ReactNode;
}

interface PaymentMethodSelectorProps {
  selected: 'wompi' | 'mercadopago' | '';
  onChange: (method: 'wompi' | 'mercadopago') => void;
  error?: string;
}


const WompiLogo = () => (
  <img
    src="/images/logo/logo wompi.svg"
  />
);


const MercadoPagoLogo = () => (
  <img
    src="/images/logo/logo-mercado-pago.svg"
  />
);

export default function PaymentMethodSelector({ selected, onChange, error }: PaymentMethodSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  const options: PaymentMethodOption[] = [
    {
      id: 'wompi',
      name: 'Wompi',
      logo: <WompiLogo />,
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      logo: <MercadoPagoLogo />,
    },
  ];

  const selectedOption = options.find((opt) => opt.id === selected);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 relative w-full" ref={containerRef}>
      <label className="font-nunito text-[18px] text-[#231E1A] font-normal">
        {t.checkout.paymentMethodLabel}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#D9D1C0] transition-all border outline-none cursor-pointer
            ${error 
              ? 'border-red-400 focus:border-red-500' 
              : open 
                ? 'border-[#686A54] shadow-sm' 
                : 'border-transparent'
            }`}
        >
          {selectedOption ? (
            <div className="flex items-center gap-3">
              {selectedOption.logo}
              <span className="font-nunito font-light text-[15px] text-[#231E1A]">
                {selectedOption.name}
              </span>
            </div>
          ) : (
            <span className="font-nunito font-light text-[15px] text-[#BDB39B]">
              {t.checkout.paymentMethodPlaceholder}
            </span>
          )}
          
          <svg
            className={`w-3.5 h-3.5 text-[#7A6F5E] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 10 6"
          >
            <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FAF8F5] border border-[#BDB39B] rounded-xl shadow-lg z-50 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#D9D1C0]/40 text-left font-nunito text-[15px] text-[#231E1A] transition-colors cursor-pointer border-b border-[#E8E2DA] last:border-b-0
                  ${selected === opt.id ? 'bg-[#D9D1C0]/25 font-medium' : 'font-light'}`}
              >
                {opt.logo}
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <span className="font-nunito text-[13px] text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
