'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Ticket } from '@/types';
import type { BuyerInfo } from '@/types/checkout';

export default function QuickSellPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as 'es' | 'en') || 'es';

  // State variables
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingTickets, setFetchingTickets] = useState<boolean>(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    confirmEmail: '',
    docType: 'C.C',
    docNumber: '',
    phonePrefix: '+57',
    locale: 'es', // Language of preference for the buyer
  });

  const [errors, setErrors] = useState<Partial<typeof form & { ticket: string }>>({});

  // Load tickets on mount
  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
          if (data.length > 0) {
            setSelectedTicketId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setFetchingTickets(false);
      }
    }
    fetchTickets();
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const isIndividual = selectedTicket?.stock !== undefined;

  function validate() {
    const newErrors: Partial<typeof form & { ticket: string }> = {};
    
    if (!selectedTicketId) newErrors.ticket = 'Debes seleccionar una boleta o mesa.';
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!form.docNumber.trim()) newErrors.docNumber = 'El documento es obligatorio.';
    
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Número de teléfono inválido (debe tener entre 7 y 15 dígitos).';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Correo electrónico inválido.';
    }
    
    if (form.email.toLowerCase().trim() !== form.confirmEmail.toLowerCase().trim()) {
      newErrors.confirmEmail = 'Los correos electrónicos no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegisterSale(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);

    const buyerInfo = {
      name: form.name.trim(),
      phone: `${form.phonePrefix} ${form.phone.trim()}`,
      email: form.email.toLowerCase().trim(),
      docType: form.docType,
      docNumber: form.docNumber.trim(),
      locale: form.locale,
    };

    try {
      const res = await fetch('/api/admin/quick-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          quantity: isIndividual ? quantity : 1,
          buyerInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Error al procesar el registro de la venta.');
        setLoading(false);
        return;
      }

      // Save info in sessionStorage as fallback (success page reads from here)
      sessionStorage.setItem(`checkout_buyer_${selectedTicketId}`, JSON.stringify(buyerInfo));
      sessionStorage.setItem(`checkout_quantity_${selectedTicketId}`, (isIndividual ? quantity : 1).toString());
      sessionStorage.setItem(`checkout_order_${selectedTicketId}`, data.orderId);

      // Redirect to the success screen
      const langPrefix = form.locale === 'en' ? '/en' : '';
      router.push(`${langPrefix}/checkout/${selectedTicketId}/success?orderId=${data.orderId}`);
    } catch (err) {
      console.error('Error submitting quick sell:', err);
      setSubmitError('Ocurrió un error de red al procesar el registro.');
      setLoading(false);
    }
  }

  if (fetchingTickets) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#686A54] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-[#231E1A] font-light text-center">Cargando tipos de boleta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E8E2DA] overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-[#686A54] px-8 py-6 text-center text-[#F4EFE9]">
          <div className="flex justify-center mb-2">
            <img src="/images/icon/Íconos WEB 1.png" alt="Boho Sunday" className="h-12 w-auto invert opacity-90" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">REGISTRO DE VENTA MANUAL</h1>
          <p className="text-xs text-[#d9d1c0] mt-1 uppercase tracking-widest font-semibold">Exclusivo para Staff y Servicio al Cliente</p>
        </div>

        <form onSubmit={handleRegisterSale} className="px-8 py-8 space-y-6">
          
          {/* General Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {submitError}
            </div>
          )}

          {/* Ticket Type & Quantity Selection */}
          <div className="bg-[#FAF8F5] border border-[#E8E2DA] p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-[#686A54] uppercase tracking-wider">Información del Producto</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Boleta / Mesa</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => {
                    setSelectedTicketId(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                >
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - ${t.price.toLocaleString('es-CO')} {t.stock !== undefined ? `(Stock: ${(t as any).remaining ?? t.stock})` : '(Mesa)'}
                    </option>
                  ))}
                </select>
                {errors.ticket && <p className="text-red-500 text-xs mt-1">{errors.ticket}</p>}
              </div>

              {isIndividual && (
                <div>
                  <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buyer Information Form */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#686A54] uppercase tracking-wider">Datos del Comprador</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Tipo de Documento</label>
                <select
                  value={form.docType}
                  onChange={(e) => setForm({ ...form, docType: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                >
                  <option value="C.C">C.C. (Cédula de Ciudadanía)</option>
                  <option value="C.E">C.E. (Cédula de Extranjería)</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Número de Documento</label>
                <input
                  type="text"
                  placeholder="Ej. 12345678"
                  value={form.docNumber}
                  onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                />
                {errors.docNumber && <p className="text-red-500 text-xs mt-1">{errors.docNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@correo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Confirm Email */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Confirmar Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@correo.com"
                  value={form.confirmEmail}
                  onChange={(e) => setForm({ ...form, confirmEmail: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                />
                {errors.confirmEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmEmail}</p>}
              </div>

              {/* Phone Prefix */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Indicativo Teléfono</label>
                <select
                  value={form.phonePrefix}
                  onChange={(e) => setForm({ ...form, phonePrefix: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                >
                  <option value="+57">🇨🇴 Colombia (+57)</option>
                  <option value="+1">🇺🇸 EE.UU. (+1)</option>
                  <option value="+34">🇪🇸 España (+34)</option>
                  <option value="+52">🇲🇽 México (+52)</option>
                  <option value="+58">🇻🇪 Venezuela (+58)</option>
                  <option value="+507">🇵🇦 Panamá (+507)</option>
                  <option value="+51">🇵🇪 Perú (+51)</option>
                  <option value="+593">🇪🇨 Ecuador (+593)</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Celular</label>
                <input
                  type="text"
                  placeholder="300 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Language Preference */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Idioma para el envío del QR</label>
                <select
                  value={form.locale}
                  onChange={(e) => setForm({ ...form, locale: e.target.value })}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                >
                  <option value="es">Español (Enviará plantilla en Español)</option>
                  <option value="en">English (Enviará plantilla en Inglés)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#686A54] text-[#F4EFE9] font-bold text-sm tracking-widest rounded-xl hover:opacity-90 transition-opacity uppercase focus:outline-none flex justify-center items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  PROCESANDO Y GENERANDO QR...
                </>
              ) : (
                'GENERAR QR Y REGISTRAR VENTA'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
