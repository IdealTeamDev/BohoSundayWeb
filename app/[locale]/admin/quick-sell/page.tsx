'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Ticket } from '@/types';

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

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    orderId: string;
    buyerName: string;
    buyerEmail: string;
    ticketName: string;
    qrUrl: string;
    qrImageUrl: string;
    isIndividual: boolean;
    quantity: number;
    locale: string;
  } | null>(null);

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

    const finalQty = isIndividual ? quantity : 1;

    try {
      const res = await fetch('/api/admin/quick-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          quantity: finalQty,
          buyerInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Error al procesar el registro de la venta.');
        setLoading(false);
        return;
      }

      // Generate URLs for the modal
      const siteUrl = window.location.origin;
      const qrUrl = `${siteUrl}/api/qrs/${data.orderId}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

      // Show success modal with all data
      setModalData({
        orderId: data.orderId,
        buyerName: buyerInfo.name,
        buyerEmail: buyerInfo.email,
        ticketName: selectedTicket?.name || 'Boleta/Mesa',
        qrUrl,
        qrImageUrl,
        isIndividual,
        quantity: finalQty,
        locale: form.locale,
      });
      setShowModal(true);
      setLoading(false);

    } catch (err) {
      console.error('Error submitting quick sell:', err);
      setSubmitError('Ocurrió un error de red al procesar el registro.');
      setLoading(false);
    }
  }

  // Clear form and start a new sale
  function handleResetForm() {
    setForm({
      ...form,
      name: '',
      phone: '',
      email: '',
      confirmEmail: '',
      docNumber: '',
    });
    setQuantity(1);
    setShowModal(false);
    setModalData(null);
    setErrors({});
  }

  // Share buttons handlers
  function handleCopyQR() {
    if (!modalData) return;
    navigator.clipboard.writeText(modalData.qrUrl);
    alert('¡Enlace del código QR copiado al portapapeles!');
  }

  function handleShareWhatsApp() {
    if (!modalData) return;
    
    let message = '';
    if (modalData.locale === 'en') {
      message = modalData.isIndividual
        ? `Hello! Your ticket entry (${modalData.ticketName} - Qty: ${modalData.quantity}) for Boho Sunday is confirmed. Access Code: ${modalData.orderId}. View your QR code here: ${modalData.qrUrl}`
        : `Hello! Your table reservation (${modalData.ticketName}) for Boho Sunday is confirmed. Access Code: ${modalData.orderId}. View your QR code here: ${modalData.qrUrl}`;
    } else {
      message = modalData.isIndividual
        ? `¡Hola! Tu entrada (${modalData.ticketName} - Cant: ${modalData.quantity}) para Boho Sunday ha sido confirmada. Código de Acceso: ${modalData.orderId}. Puedes ver tu código QR de ingreso aquí: ${modalData.qrUrl}`
        : `¡Hola! Tu reserva de mesa (${modalData.ticketName}) para Boho Sunday ha sido confirmada. Código de Acceso: ${modalData.orderId}. Puedes ver tu código QR de ingreso aquí: ${modalData.qrUrl}`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
    <div className="min-h-screen bg-[#F4EFE9] py-12 px-4 sm:px-6 lg:px-8 relative">
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

      {/* Success Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE9] max-w-md w-full rounded-3xl p-6 shadow-xl border border-[#E8E2DA] flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
            
            {/* Success Checkmark Circle */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-[#22c55e]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 className="font-sans font-bold text-xl text-[#231E1A] mb-1">¡VENTA REGISTRADA!</h2>
            <p className="text-xs text-[#7A6F5E] mb-5 uppercase tracking-wider font-semibold">Correo y QR generados correctamente</p>

            {/* Notification Alert Box */}
            <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 w-full text-left space-y-3 mb-5 text-sm">
              <div>
                <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Cliente</span>
                <span className="font-semibold text-[#231E1A]">{modalData.buyerName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Producto</span>
                  <span className="font-semibold text-[#231E1A]">{modalData.ticketName}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Cantidad</span>
                  <span className="font-semibold text-[#231E1A]">{modalData.quantity}</span>
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide font-semibold text-[#686A54]">Correo de Envío</span>
                <span className="font-semibold text-[#231E1A] break-all">{modalData.buyerEmail}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Código de Orden</span>
                <span className="font-mono text-[#231E1A] font-bold text-[12px]">{modalData.orderId}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-[#D9D1C0] rounded-2xl p-4 w-fit mb-6">
              <img src={modalData.qrImageUrl} alt="QR Code" width={150} height={150} className="rounded-lg shadow-inner bg-white p-1" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              {/* Send to WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl text-[13px] tracking-wider uppercase hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.989-1.874-1.875-4.351-2.907-6.985-2.907-5.439 0-9.865 4.421-9.869 9.867-.001 1.57.418 3.101 1.21 4.474l-.993 3.624 3.71-.973zm12.39-7.37c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.054-.94-1.766-2.1-1.972-2.45-.205-.35-.022-.539.128-.689.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C10.1 7.225 9.5 5.75 9.25 5.15c-.243-.59-.49-.51-.676-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275.975-1.05 3.075-1.05 3.175 0 .1.1.2.2.35.1.15.5.75 1.2 1.375.677.6 1.25.9 1.95 1.15.7.25 1.325.225 1.825.15.55-.083 1.772-.725 2.022-1.425.25-.7.25-1.3 1.75-1.425.075-.015.15-.025.225-.025.2 0 .325.1.375.175.25.4.25 1.05.25 1.05z"/>
                </svg>
                Compartir por WhatsApp
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Copy QR Link */}
                <button
                  onClick={handleCopyQR}
                  className="py-3 bg-white border border-[#E0D9D0] text-[#7A6F5E] hover:bg-white/70 font-semibold rounded-xl text-[12px] uppercase transition-colors"
                >
                  Copiar Link QR
                </button>

                {/* Close and Register Another */}
                <button
                  onClick={handleResetForm}
                  className="py-3 bg-[#686A54] text-[#F4EFE9] hover:opacity-90 font-semibold rounded-xl text-[12px] uppercase transition-opacity"
                >
                  Registrar Otro
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
