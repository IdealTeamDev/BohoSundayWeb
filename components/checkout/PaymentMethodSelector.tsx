import { useState, useEffect, useRef } from 'react';

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

// Custom SVG for Wompi Logo (stylized geometric W)
const WompiLogo = () => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none" className="shrink-0">
    <path
      d="M8 32 L15.5 8 H21 L16.5 24 L21 8 H26.5 L19 32 H14.5 L19 16 L14.5 32 H8 Z"
      fill="#1D1D24"
      stroke="#1D1D24"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.5 8 L32 25 L29 32 H35 L38 8 H32 L29 17 L32 8 H26.5 Z"
      fill="#1D1D24"
      stroke="#1D1D24"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom SVG for Mercado Pago Logo (circle with handshake lines)
const MercadoPagoLogo = () => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none" className="shrink-0">
    <circle cx="15" cy="15" r="14" fill="#009EE3" />
    {/* Stylized handshake */}
    <path
      d="M9 16.5 C9 16.5 11 13 14 15 C17 17 21 13.5 21 13.5 M9 13.5 C9 13.5 11.5 16.5 14.5 14.5 C17.5 12.5 21 16.5 21 16.5"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 11.5 C11.5 10.5 10 11.5 9 12.5 C8 13.5 9.5 15.5 10.5 14.5 M17.5 18.5 C18.5 19.5 20 18.5 21 17.5 C22 16.5 20.5 14.5 19.5 15.5"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function PaymentMethodSelector({ selected, onChange, error }: PaymentMethodSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        Método de pago
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
              Selecciona tu método de pago
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
