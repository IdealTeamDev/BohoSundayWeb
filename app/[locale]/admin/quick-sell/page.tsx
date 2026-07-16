'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Ticket } from '@/types';
import { jsPDF } from 'jspdf';

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
  const [stages, setStages] = useState<any[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [fetchingStages, setFetchingStages] = useState<boolean>(true);
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

  // Metrics Modal State
  const [showMetricsModal, setShowMetricsModal] = useState<boolean>(false);
  const [metricsData, setMetricsData] = useState<{
    zones: Array<{ zone: string; name: string; total: number; sold: number; remaining: number; revenue: number }>;
    individuals: Array<{ id: string; name: string; totalStock: number; sold: number; remaining: number; revenue: number }>;
  } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Search Buyer and Resend QR State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [resending, setResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Authentication State
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push(`/${currentLocale}/admin/login`);
    } else {
      setCheckingAuth(false);
    }
  }, [currentLocale, router]);

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    router.push(`/${currentLocale}/admin/login`);
  }


  // Search logic
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem('admin_token') || '';
        const res = await fetch(`/api/admin/quick-sell/search?q=${encodeURIComponent(searchTerm)}`, {
          headers: { 'x-admin-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setSearchResults(data.data);
            setShowDropdown(true);
          }
        }
      } catch (err) {
        console.error('Error searching buyers:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  async function handleResendQR(orderId: string) {
    setResending(true);
    setResendStatus(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/quick-sell/resend-qr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus({ type: 'success', message: data.message || 'El código QR ha sido reenviado con éxito.' });
      } else {
        setResendStatus({ type: 'error', message: data.error || 'Error al reenviar el código QR.' });
      }
    } catch (err) {
      console.error('Error resending QR:', err);
      setResendStatus({ type: 'error', message: 'Error de red al reenviar el código QR.' });
    } finally {
      setResending(false);
    }
  }

  async function downloadQRImage(orderId: string, buyerName: string) {
    try {
      const siteUrl = window.location.origin;
      const qrUrl = `${siteUrl}/api/qrs/${orderId}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR_${buyerName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading QR image:', err);
      const siteUrl = window.location.origin;
      const qrUrl = `${siteUrl}/api/qrs/${orderId}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
      window.open(qrImageUrl, '_blank');
    }
  }

  function downloadMetricsPDF() {
    if (!metricsData) return;

    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Header Banner
      doc.setFillColor(104, 106, 84); // #686A54
      doc.rect(0, 0, 210, 35, 'F');

      // Title inside header
      doc.setTextColor(244, 239, 233); // #F4EFE9
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('REPORTE DE VENTAS - BOHO SUNDAY', margin, 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, margin, 29);

      // Reset text color to dark gray
      doc.setTextColor(35, 30, 26); // #231E1A
      y = 50;

      // Summary totals
      const totalMesasSold = metricsData.zones.reduce((sum, z) => sum + z.sold, 0);
      const totalMesasRevenue = metricsData.zones.reduce((sum, z) => sum + z.revenue, 0);
      const totalIndivSold = metricsData.individuals.reduce((sum, i) => sum + i.sold, 0);
      const totalIndivRevenue = metricsData.individuals.reduce((sum, i) => sum + i.revenue, 0);
      const totalRevenue = totalMesasRevenue + totalIndivRevenue;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Resumen General de Ventas', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Recaudacion Total: $${totalRevenue.toLocaleString('es-CO')} COP`, margin, y);
      y += 6;
      doc.text(`Total Mesas/Camas Vendidas: ${totalMesasSold}`, margin, y);
      y += 6;
      doc.text(`Total Boletas Individuales Vendidas: ${totalIndivSold}`, margin, y);
      y += 12;

      // Table 1: Mesas y Camas por Zona
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Reservas de Mesas y Camas por Zona', margin, y);
      y += 8;

      // Table headers
      doc.setFontSize(10);
      doc.setFillColor(244, 239, 233); // #F4EFE9
      doc.rect(margin, y - 5, 170, 7, 'F');
      doc.text('Zona', margin + 2, y);
      doc.text('Vendidas', margin + 60, y);
      doc.text('Disponibles', margin + 90, y);
      doc.text('Total', margin + 120, y);
      doc.text('Recaudado (COP)', margin + 140, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      metricsData.zones.forEach((z) => {
        doc.text(z.name || z.zone, margin + 2, y);
        doc.text(String(z.sold), margin + 60, y);
        doc.text(String(z.remaining), margin + 90, y);
        doc.text(String(z.total), margin + 120, y);
        doc.text(`$${z.revenue.toLocaleString('es-CO')}`, margin + 140, y);
        
        doc.setDrawColor(232, 226, 218); // #E8E2DA
        doc.line(margin, y + 2, margin + 170, y + 2);
        y += 8;
      });
      y += 10;

      // Table 2: Boleteria Individual
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Boleteria Individual', margin, y);
      y += 8;

      // Table headers
      doc.setFontSize(10);
      doc.setFillColor(244, 239, 233); // #F4EFE9
      doc.rect(margin, y - 5, 170, 7, 'F');
      doc.text('Tipo de Entrada', margin + 2, y);
      doc.text('Vendidas', margin + 60, y);
      doc.text('Stock Restante', margin + 90, y);
      doc.text('Recaudado (COP)', margin + 130, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      metricsData.individuals.forEach((i) => {
        doc.text(i.name, margin + 2, y);
        doc.text(String(i.sold), margin + 60, y);
        doc.text(String(i.remaining), margin + 90, y);
        doc.text(`$${i.revenue.toLocaleString('es-CO')}`, margin + 130, y);
        
        doc.setDrawColor(232, 226, 218); // #E8E2DA
        doc.line(margin, y + 2, margin + 170, y + 2);
        y += 8;
      });

      doc.save(`reporte_ventas_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el archivo PDF.');
    }
  }

  async function handleOpenMetrics() {
    setShowMetricsModal(true);
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/quick-sell/stats', {
        headers: { 'x-admin-token': token }
      });
      if (!res.ok) throw new Error('Error al obtener las métricas');
      const data = await res.json();
      if (data.success && data.data) {
        setMetricsData(data.data);
      } else {
        throw new Error(data.error || 'Error al obtener las métricas');
      }
    } catch (err: any) {
      console.error('Error fetching metrics:', err);
      setMetricsError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoadingMetrics(false);
    }
  }

  // Load stages on mount
  useEffect(() => {
    async function fetchStages() {
      try {
        const token = localStorage.getItem('admin_token') || '';
        const res = await fetch('/api/admin/stages', {
          headers: { 'x-admin-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStages(data.stages);
            if (data.activeStageId) {
              setActiveStageId(data.activeStageId);
              setSelectedStageId(data.activeStageId);
            } else if (data.stages.length > 0) {
              setSelectedStageId(data.stages[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching stages:', err);
      } finally {
        setFetchingStages(false);
      }
    }
    fetchStages();
  }, []);

  // Load tickets when selectedStageId or fetchingStages changes
  useEffect(() => {
    async function fetchTickets() {
      setFetchingTickets(true);
      try {
        const url = selectedStageId ? `/api/tickets?stageId=${selectedStageId}` : '/api/tickets';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
          if (data.length > 0) {
            const stillValid = data.some((t: any) => t.id === selectedTicketId);
            if (!stillValid) {
              setSelectedTicketId(data[0].id);
            }
          } else {
            setSelectedTicketId('');
          }
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setFetchingTickets(false);
      }
    }

    if (!fetchingStages) {
      fetchTickets();
    }
  }, [selectedStageId, fetchingStages]);

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
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/quick-sell', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          quantity: finalQty,
          buyerInfo,
          stageId: selectedStageId,
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
        ticketName: selectedTicket?.stock === undefined
          ? `${selectedTicket?.name || 'Cama'} #${selectedTicket?.number}`
          : selectedTicket?.name || 'Boleta',
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#686A54] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-[#231E1A] font-light text-center">Verificando sesión...</p>
      </div>
    );
  }

  if (fetchingTickets) {
    return (
      <div className="min-h-screen bg-[#F4EFE9] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-10 h-10 border-4 border-[#686A54] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-[#231E1A] font-light text-center">Cargando tipos de boleta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Metrics & Logout Buttons at the top of the container */}
      <div className="max-w-2xl mx-auto flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2.5 bg-white border border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all font-bold text-xs tracking-wider uppercase shadow-sm flex items-center gap-2 cursor-pointer font-sans"
        >
          Cerrar Sesión
        </button>
        <button
          type="button"
          onClick={handleOpenMetrics}
          className="px-4 py-2.5 bg-[#686A54] text-[#F4EFE9] rounded-xl hover:opacity-90 transition-all font-bold text-xs tracking-wider uppercase shadow-sm flex items-center gap-2 cursor-pointer font-sans"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          VER MÉTRICAS DE VENTAS
        </button>
      </div>

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
              {/* Selector de Etapa del Evento */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Etapa del Evento (Cambio de Precios)</label>
                <select
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(e.target.value)}
                  className="w-full bg-white border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
                >
                  <option value="">-- Precios Base (Sin Etapa) --</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.id === activeStageId ? ' ★ (Etapa Actual)' : ''}
                    </option>
                  ))}
                </select>
              </div>

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
                      {t.name} - ${t.price.toLocaleString('es-CO')} {t.stock !== undefined ? `(Stock: ${(t as any).remaining ?? t.stock})` : `(Cama #${t.number})`}
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

      {/* Search Buyer and Resend QR Section */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E8E2DA] overflow-hidden mt-8 p-8 space-y-6">
        <div className="flex items-center gap-2 text-[#686A54] border-b border-[#FAF8F5] pb-3 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h2 className="font-sans font-bold text-base uppercase tracking-wide">Buscador y Reenvio de Codigos QR</h2>
        </div>

        <p className="text-xs text-[#7A6F5E] leading-relaxed font-sans">
          Busca a un comprador por su **nombre** o **correo electronico** para consultar los detalles de su compra y reenviarle el correo de confirmacion con el codigo QR.
        </p>

        <div className="relative font-sans">
          <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Buscar Comprador</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej. Juan Perez o juan@correo.com"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E0D9D0] rounded-xl pl-4 pr-10 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
            />
            {searching && (
              <div className="absolute right-3 top-3.5">
                <div className="w-4 h-4 border-2 border-[#686A54] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E8E2DA] rounded-xl shadow-lg max-h-60 overflow-y-auto z-40 divide-y divide-[#FAF8F5]">
              {searchResults.map((result) => (
                <button
                  key={result.orderId}
                  type="button"
                  onClick={() => {
                    setSelectedUser(result);
                    setShowDropdown(false);
                    setSearchTerm('');
                    setResendStatus(null);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#FAF8F5] transition-colors flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-semibold text-sm text-[#231E1A]">{result.buyerName}</span>
                  <span className="text-xs text-[#7A6F5E]">{result.buyerEmail} | {result.ticketName} {result.ticketNumber ? `#${result.ticketNumber}` : ''}</span>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchResults.length === 0 && searchTerm.trim().length >= 2 && !searching && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E8E2DA] rounded-xl shadow-lg p-4 text-center text-xs text-[#7A6F5E] z-40">
              No se encontraron compradores con esos terminos.
            </div>
          )}
        </div>

        {/* Selected User Details Card */}
        {selectedUser && (
          <div className="bg-[#FAF8F5] border border-[#E8E2DA] rounded-2xl p-5 space-y-4 font-sans">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-[#686A54] uppercase tracking-wider">Detalles del Comprador Seleccionado</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setResendStatus(null);
                }}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Nombre</span>
                <span className="font-semibold text-[#231E1A]">{selectedUser.buyerName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Correo Electronico</span>
                <span className="font-semibold text-[#231E1A] break-all">{selectedUser.buyerEmail}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Telefono</span>
                <span className="font-semibold text-[#231E1A]">{selectedUser.buyerPhone}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Producto Adquirido</span>
                <span className="font-semibold text-[#231E1A]">
                  {selectedUser.ticketName} {selectedUser.ticketNumber ? `#${selectedUser.ticketNumber}` : ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Codigo de Orden</span>
                <span className="font-mono text-[#231E1A] font-bold text-[11px]">{selectedUser.orderId}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#7A6F5E] uppercase tracking-wide">Total Entradas</span>
                <span className="font-semibold text-[#231E1A]">{selectedUser.totalAccesos}</span>
              </div>
            </div>

            {resendStatus && (
              <div className={`px-4 py-2.5 rounded-xl text-xs ${resendStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {resendStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleResendQR(selectedUser.orderId)}
                disabled={resending}
                className="w-full py-3 bg-[#686A54] text-[#F4EFE9] font-bold text-xs tracking-wider uppercase rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer font-sans"
              >
                {resending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    REENVIANDO...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    REENVIAR POR EMAIL
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => downloadQRImage(selectedUser.orderId, selectedUser.buyerName)}
                className="w-full py-3 bg-white border border-[#686A54] text-[#686A54] hover:bg-[#686A54]/10 transition-colors font-bold text-xs tracking-wider uppercase rounded-xl flex justify-center items-center gap-2 cursor-pointer font-sans"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                DESCARGAR QR IMAGEN
              </button>
            </div>
          </div>
        )}
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

      {/* Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EFE9] max-w-2xl w-full rounded-3xl p-6 shadow-xl border border-[#E8E2DA] flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#E8E2DA] mb-4">
              <div className="flex items-center gap-2 text-[#686A54]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <h2 className="font-sans font-bold text-lg uppercase tracking-wider">Métricas de Ventas en Tiempo Real</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMetricsModal(false)}
                className="w-8 h-8 rounded-full bg-[#E8E2DA] flex items-center justify-center text-[#231E1A] hover:bg-[#D8D0C5] transition-colors text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-sm">
              {loadingMetrics && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#686A54] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-light text-[#7A6F5E]">Cargando estadísticas...</p>
                </div>
              )}

              {metricsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {metricsError}
                </div>
              )}

              {!loadingMetrics && !metricsError && metricsData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4">
                      <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Total Recaudado</span>
                      <span className="text-xl font-bold text-[#231E1A]">
                        ${(
                          metricsData.zones.reduce((sum, z) => sum + z.revenue, 0) +
                          metricsData.individuals.reduce((sum, i) => sum + i.revenue, 0)
                        ).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4">
                      <span className="block text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wide">Total Entradas Vendidas</span>
                      <span className="text-xl font-bold text-[#231E1A]">
                        {(
                          metricsData.zones.reduce((sum, z) => sum + z.sold, 0) +
                          metricsData.individuals.reduce((sum, i) => sum + i.sold, 0)
                        ).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Mesas y Camas */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#686A54] uppercase tracking-wider border-l-2 border-[#686A54] pl-2">
                      Reservas de Mesas y Camas por Zona
                    </h3>
                    <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-inner">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA] text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wider">
                              <th className="px-4 py-3">Zona</th>
                              <th className="px-4 py-3 text-center">Vendidas</th>
                              <th className="px-4 py-3 text-center">Disponibles</th>
                              <th className="px-4 py-3 text-right">Recaudado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FAF8F5]">
                            {metricsData.zones.map((zone) => (
                              <tr key={zone.zone} className="hover:bg-[#FAF8F5]/50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-[#231E1A]">{zone.name}</td>
                                <td className="px-4 py-3 text-center font-bold text-[#686A54]">{zone.sold}</td>
                                <td className="px-4 py-3 text-center text-[#7A6F5E]">{zone.remaining}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-[#231E1A]">
                                  ${zone.revenue.toLocaleString('es-CO')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Boleteria Individual */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#686A54] uppercase tracking-wider border-l-2 border-[#686A54] pl-2">
                      Boletería Individual
                    </h3>
                    <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-inner">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF8F5] border-b border-[#E8E2DA] text-[11px] font-bold text-[#7A6F5E] uppercase tracking-wider">
                              <th className="px-4 py-3">Tipo de Entrada</th>
                              <th className="px-4 py-3 text-center">Vendidas</th>
                              <th className="px-4 py-3 text-center">Stock Disponible</th>
                              <th className="px-4 py-3 text-right">Recaudado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#FAF8F5]">
                            {metricsData.individuals.map((ind) => (
                              <tr key={ind.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-[#231E1A]">{ind.name}</td>
                                <td className="px-4 py-3 text-center font-bold text-[#686A54]">{ind.sold}</td>
                                <td className="px-4 py-3 text-center text-[#7A6F5E]">{ind.remaining}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-[#231E1A]">
                                  ${ind.revenue.toLocaleString('es-CO')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#E8E2DA] mt-4 flex justify-between items-center">
              {metricsData && (
                <button
                  type="button"
                  onClick={downloadMetricsPDF}
                  className="px-5 py-2.5 bg-white border border-[#686A54] text-[#686A54] hover:bg-[#686A54]/10 transition-colors font-bold text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 cursor-pointer font-sans"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  DESCARGAR REPORTE PDF
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMetricsModal(false)}
                className="px-6 py-2.5 bg-[#686A54] text-[#F4EFE9] font-bold text-xs tracking-wider uppercase rounded-xl hover:opacity-90 transition-opacity cursor-pointer font-sans"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
