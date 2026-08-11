'use client';

import { useState } from 'react';

// Lista simplificada de códigos de país de América y Europa para el formulario
const COUNTRY_CODES = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+5 Peru', flag: '🇵🇪', name: 'Perú' }, // Simplificado
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
];

interface PreRegisterProps {
  t: {
    title: string;
    subtitle: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderPhone: string;
    buttonText: string;
    successMessage: string;
    errorMessage: string;
    loadingMessage: string;
  };
}

export const PreRegister = ({ t }: PreRegisterProps) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+57');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const telefonoCompleto = `${phoneCode} ${phoneNumber.trim()}`;

    try {
      const response = await fetch('/api/pre-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCompleto: nombre.trim(),
          email: email.trim(),
          telefono: telefonoCompleto,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMsg({ type: 'success', text: t.successMessage });
        setNombre('');
        setEmail('');
        setPhoneNumber('');
      } else {
        setStatusMsg({ type: 'error', text: result.error || t.errorMessage });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: t.errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-14 px-4 md:px-10 bg-[#FDFCF8] border-y border-[#EDEBE5]">
      <div className="w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl flex flex-col md:flex-row gap-8 items-center justify-between">
        
        {/* Lado Izquierdo (Textos) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left select-none">
          <h2 className="text-[#231E1A] text-[28px] md:text-[34px] font-bold font-averia uppercase tracking-wide leading-tight mb-3">
            {t.title}
          </h2>
          <p className="text-black lg:text-[18px] text-[17px]/6 font-nunito font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Lado Derecho (Formulario) */}
        <form onSubmit={handleSubmit} className="w-full md:w-[45%] flex flex-col gap-4">
          {/* Nombre Completo */}
          <input
            type="text"
            required
            placeholder={t.placeholderName}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#231E1A] text-black font-nunito font-light bg-[#FAF8F5] placeholder-gray-400"
          />

          {/* Correo Electrónico */}
          <input
            type="email"
            required
            placeholder={t.placeholderEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#231E1A] text-black font-nunito font-light bg-[#FAF8F5] placeholder-gray-400"
          />

          {/* Teléfono con selector de País */}
          <div className="w-full flex border border-gray-300 rounded-xl bg-[#FAF8F5] overflow-hidden focus-within:ring-1 focus-within:ring-[#231E1A]">
            <div className="relative flex items-center bg-[#FAF8F5] px-3 border-r border-gray-200">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full z-10"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code} className="text-black bg-white text-[13px]">
                    {item.flag} {item.code} ({item.name})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 text-black font-nunito font-light select-none pointer-events-none text-[13px]">
                <span>{COUNTRY_CODES.find(c => c.code === phoneCode)?.flag}</span>
                <span className="font-light text-black">{phoneCode}</span>
                <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
            <input
              type="tel"
              required
              placeholder={t.placeholderPhone}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Solo números
              className="flex-1 px-4 py-3.5 focus:outline-none text-black font-nunito font-light bg-[#FAF8F5] placeholder-gray-400"
            />
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#231E1A] hover:bg-black text-[#FAF8F5] font-nunito font-semibold text-[17px] py-4 rounded-xl normal-case transition duration-300 shadow-md disabled:opacity-75 focus:outline-none"
          >
            {loading ? t.loadingMessage : t.buttonText}
          </button>

          {/* Mensajes de Estado */}
          {statusMsg && (
            <p className={`text-center font-nunito font-light text-sm mt-1 ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {statusMsg.text}
            </p>
          )}
        </form>

      </div>
    </div>
  );
};
