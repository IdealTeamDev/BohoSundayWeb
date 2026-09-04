'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Ticket } from '@/types';
import { jsPDF } from 'jspdf';
import { sortedCountries, getFlagEmoji } from '@/data/countries';
import AdminEventMap from '@/components/eventmap/AdminEventMap';

export default function QuickSellPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as 'es' | 'en') || 'es';

  // Navigation View State: 'resumen' | 'venta' | 'mapa' | 'compras'
  const [activeView, setActiveView] = useState<'resumen' | 'venta' | 'mapa' | 'compras'>('resumen');

  // Authentication State
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Event Editions State
  const [editions, setEditions] = useState<any[]>([]);
  const [activeEdition, setActiveEdition] = useState<{ id: string; slug: string; name: string } | null>(null);
  const [selectedEditionFilter, setSelectedEditionFilter] = useState<string>('all');
  const [showEditionsModal, setShowEditionsModal] = useState<boolean>(false);
  const [newEditionName, setNewEditionName] = useState<string>('');
  const [creatingEdition, setCreatingEdition] = useState<boolean>(false);
  const [resettingInventory, setResettingInventory] = useState<boolean>(false);

  // Resumen / Dashboard State
  const [resumenLoading, setResumenLoading] = useState<boolean>(false);
  const [resumenStats, setResumenStats] = useState<{
    totalRevenue: number;
    totalSold: number;
    totalCheckIns: number;
    totalOrders: number;
    totalCapacity: number;
  }>({
    totalRevenue: 0,
    totalSold: 0,
    totalCheckIns: 0,
    totalOrders: 0,
    totalCapacity: 0,
  });
  const [zoneStats, setZoneStats] = useState<Array<{
    zone: string;
    name: string;
    total: number;
    sold: number;
    remaining: number;
    revenue: number;
  }>>([]);
  const [editionsComparison, setEditionsComparison] = useState<any[]>([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Sale Form State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [loadingSale, setLoadingSale] = useState<boolean>(false);
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
    locale: 'es',
  });

  const [errors, setErrors] = useState<Partial<typeof form & { ticket: string; quantity?: string }>>({});

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
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

  // Search Buyer and Resend/Download QR State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [resending, setResending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Purchases List Module State
  const [purchasedList, setPurchasedList] = useState<any[]>([]);
  const [purchasedLoading, setPurchasedLoading] = useState<boolean>(false);
  const [purchasedError, setPurchasedError] = useState<string | null>(null);
  const [purchasedZones, setPurchasedZones] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [purchasedSearch, setPurchasedSearch] = useState<string>('');
  const [purchasedPage, setPurchasedPage] = useState<number>(1);
  const [purchasedLimit, setPurchasedLimit] = useState<number>(10);
  const [purchasedTotal, setPurchasedTotal] = useState<number>(0);
  const [purchasedTotalPages, setPurchasedTotalPages] = useState<number>(1);

  // Check auth token
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

  // Fetch Editions
  const fetchEditions = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/editions', {
        headers: { 'x-admin-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEditions(data.editions || []);
          setActiveEdition(data.activeEdition || null);
        }
      }
    } catch (err) {
      console.error('Error fetching editions:', err);
    }
  }, []);

  useEffect(() => {
    fetchEditions();
  }, [fetchEditions]);

  // Fetch Resumen Stats & Zone Metrics
  const fetchResumenData = useCallback(async () => {
    setResumenLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || '';
      
      // 1. Fetch main stats & comparisons
      const resStats = await fetch('/api/admin/stats?edition=all', {
        headers: { 'x-admin-token': token }
      });
      if (resStats.ok) {
        const dataStats = await resStats.json();
        if (dataStats.success) {
          // Find stats for active edition or total
          const activeSlug = dataStats.activeEdition?.slug || 'entre-soles';
          const activeComparison = (dataStats.editionsComparison || []).find((e: any) => e.slug === activeSlug);
          
          if (activeComparison) {
            setResumenStats({
              totalRevenue: activeComparison.totalRevenue || 0,
              totalSold: activeComparison.totalSold || 0,
              totalCheckIns: activeComparison.totalCheckIns || 0,
              totalOrders: activeComparison.totalOrders || 0,
              totalCapacity: dataStats.data?.totalCapacity || 44,
            });
          } else {
            setResumenStats({
              totalRevenue: dataStats.data?.totalRevenue || 0,
              totalSold: dataStats.data?.totalSold || 0,
              totalCheckIns: dataStats.data?.totalCheckIns || 0,
              totalOrders: dataStats.data?.totalOrders || 0,
              totalCapacity: dataStats.data?.totalCapacity || 44,
            });
          }
          setEditionsComparison(dataStats.editionsComparison || []);
        }
      }

      // 2. Fetch breakdown per zone for active edition
      const resZoneStats = await fetch('/api/admin/quick-sell/stats', {
        headers: { 'x-admin-token': token }
      });
      if (resZoneStats.ok) {
        const dataZones = await resZoneStats.json();
        if (dataZones.success && dataZones.data?.zones) {
          setZoneStats(dataZones.data.zones);
        }
      }

      setLastUpdatedTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching resumen data:', err);
    } finally {
      setResumenLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'resumen') {
      fetchResumenData();
    }
  }, [activeView, fetchResumenData]);

  // Fetch Stages & Tickets for Sales Form
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

  useEffect(() => {
    async function fetchTickets() {
      setFetchingTickets(true);
      try {
        const url = selectedStageId ? `/api/tickets?stageId=${selectedStageId}` : '/api/tickets';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const sorted = [...data].sort((a: any, b: any) => {
            const isIndivA = a.stock !== undefined;
            const isIndivB = b.stock !== undefined;
            if (isIndivA && !isIndivB) return -1;
            if (!isIndivA && isIndivB) return 1;
            if (isIndivA && isIndivB) {
              return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            }
            const nameCompare = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            if (nameCompare !== 0) return nameCompare;
            return (a.number || 0) - (b.number || 0);
          });
          setTickets(sorted);
          if (sorted.length > 0) {
            const stillValid = sorted.some((t: any) => t.id === selectedTicketId);
            if (!stillValid) {
              setSelectedTicketId(sorted[0].id);
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
  }, [selectedStageId, fetchingStages, selectedTicketId]);

  // Fetch Purchased Tickets Table
  const fetchPurchasedTickets = useCallback(async (
    page = purchasedPage,
    zone = selectedZone,
    search = purchasedSearch,
    limit = purchasedLimit,
    edition = selectedEditionFilter
  ) => {
    setPurchasedLoading(true);
    setPurchasedError(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        zone: zone,
        search: search,
        edition: edition,
      });

      const res = await fetch(`/api/admin/quick-sell/purchased-tickets?${params.toString()}`, {
        headers: { 'x-admin-token': token },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPurchasedList(data.data || []);
        setPurchasedTotal(data.pagination?.total || 0);
        setPurchasedTotalPages(data.pagination?.totalPages || 1);
        if (data.zones) setPurchasedZones(data.zones);
        if (data.editions) setEditions(data.editions);
      } else {
        setPurchasedError(data.error || 'Error al cargar las compras');
      }
    } catch (err) {
      console.error('Error fetching purchased tickets:', err);
      setPurchasedError('Error de red al consultar la lista de compras');
    } finally {
      setPurchasedLoading(false);
    }
  }, [purchasedPage, selectedZone, purchasedSearch, purchasedLimit, selectedEditionFilter]);

  useEffect(() => {
    if (activeView === 'compras') {
      const delayDebounceFn = setTimeout(() => {
        fetchPurchasedTickets(purchasedPage, selectedZone, purchasedSearch, purchasedLimit, selectedEditionFilter);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeView, purchasedPage, selectedZone, purchasedSearch, purchasedLimit, selectedEditionFilter, fetchPurchasedTickets]);

  // Handle Edition Actions
  const handleSetActiveEdition = async (slug: string) => {
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ action: 'set_active', slug })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveEdition(data.activeEdition);
        fetchEditions();
        fetchResumenData();
        alert(`Edición activa cambiada a: ${data.activeEdition.name}`);
      } else {
        alert(data.error || 'Error al cambiar edición activa');
      }
    } catch (err) {
      console.error('Error setting active edition:', err);
      alert('Error de red al activar la edición');
    }
  };

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) return;
    setCreatingEdition(true);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token
        },
        body: JSON.stringify({ action: 'create', name: newEditionName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewEditionName('');
        fetchEditions();
        alert(`Nueva edición "${data.edition.name}" creada exitosamente.`);
      } else {
        alert(data.error || 'Error al crear la edición');
      }
    } catch (err) {
      console.error('Error creating edition:', err);
      alert('Error de red al crear la edición');
    } finally {
      setCreatingEdition(false);
    }
  };

  const handleResetInventory = async () => {
    const confirmReset = window.confirm(
      `¿Estás seguro de reiniciar la disponibilidad del aforo de mesas y boletas para la edición activa "${activeEdition?.name || 'Entre Soles'}"?\n\nTODOS los registros históricos de clientes y ventas pasadas permanecerán 100% GUARDADOS.`
    );
    if (!confirmReset) return;

    setResettingInventory(true);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await fetch('/api/admin/editions', {
        method: 'PUT',
        headers: { 'x-admin-token': token }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Inventario e información de aforo reiniciados con éxito para la nueva edición.');
        setShowEditionsModal(false);
        fetchResumenData();
      } else {
        alert(data.error || 'Error al reiniciar inventario');
      }
    } catch (err) {
      console.error('Error resetting inventory:', err);
      alert('Error de red al reiniciar inventario');
    } finally {
      setResettingInventory(false);
    }
  };

  // Buyer Autocomplete Search Logic
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

  // Resend QR Code via Email
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
        alert(data.message || 'El código QR ha sido reenviado con éxito.');
      } else {
        setResendStatus({ type: 'error', message: data.error || 'Error al reenviar el código QR.' });
        alert(data.error || 'Error al reenviar el código QR.');
      }
    } catch (err) {
      console.error('Error resending QR:', err);
      setResendStatus({ type: 'error', message: 'Error de red al reenviar el código QR.' });
      alert('Error de red al reenviar el código QR.');
    } finally {
      setResending(false);
    }
  }

  // Download QR Code PNG Image
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

  // Download PDF Report
  function downloadMetricsPDF() {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Header Banner
      doc.setFillColor(90, 96, 70); // --olive-700
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('REPORTE DE VENTAS - BOHO SUNDAY', margin, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Edición: ${activeEdition?.name || 'Entre Soles'} · Generado el: ${new Date().toLocaleString('es-CO')}`, margin, 29);

      doc.setTextColor(38, 38, 31);
      y = 48;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Resumen General', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Recaudado Total: $${resumenStats.totalRevenue.toLocaleString('es-CO')} COP`, margin, y);
      y += 6;
      doc.text(`Boletas Vendidas: ${resumenStats.totalSold}`, margin, y);
      y += 6;
      doc.text(`Órdenes Procesadas: ${resumenStats.totalOrders}`, margin, y);
      y += 6;
      doc.text(`Check-ins / Ingresos: ${resumenStats.totalCheckIns}`, margin, y);
      y += 12;

      // Ocupación por Zona
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Ocupación de Mesas por Zona', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFillColor(243, 240, 232);
      doc.rect(margin, y - 5, 170, 7, 'F');
      doc.text('Zona', margin + 2, y);
      doc.text('Vendidas', margin + 60, y);
      doc.text('Disponibles', margin + 95, y);
      doc.text('Recaudado (COP)', margin + 130, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      zoneStats.forEach((z) => {
        doc.text(z.name || z.zone, margin + 2, y);
        doc.text(`${z.sold}/${z.total}`, margin + 60, y);
        doc.text(String(z.remaining), margin + 95, y);
        doc.text(`$${z.revenue.toLocaleString('es-CO')}`, margin + 130, y);
        
        doc.setDrawColor(227, 221, 205);
        doc.line(margin, y + 2, margin + 170, y + 2);
        y += 8;
      });

      doc.save(`reporte_boho_sunday_${activeEdition?.slug || 'entre_soles'}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el reporte PDF.');
    }
  }

  // Selected Ticket Info Calculation
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const isIndividual = selectedTicket?.stock !== undefined;
  const unitPrice = selectedTicket?.price || 0;
  const totalPrice = isIndividual ? unitPrice * (Number(quantity) || 1) : unitPrice;

  function validateForm() {
    const newErrors: Partial<typeof form & { ticket: string; quantity?: string }> = {};
    if (!selectedTicketId) newErrors.ticket = 'Debes seleccionar una boleta o mesa.';
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!form.docNumber.trim()) newErrors.docNumber = 'El documento es obligatorio.';
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Número de teléfono inválido (7 a 15 dígitos).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Correo electrónico inválido.';
    }
    if (form.email.toLowerCase().trim() !== form.confirmEmail.toLowerCase().trim()) {
      newErrors.confirmEmail = 'Los correos electrónicos no coinciden.';
    }
    if (isIndividual) {
      const qtyNum = Number(quantity);
      if (quantity === '' || isNaN(qtyNum) || qtyNum < 1) {
        newErrors.quantity = 'Cantidad inválida.';
      } else if (qtyNum > 50) {
        newErrors.quantity = 'Máximo 50 por venta.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegisterSale(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoadingSale(true);
    setSubmitError(null);

    const buyerInfo = {
      name: form.name.trim(),
      phone: `${form.phonePrefix} ${form.phone.trim()}`,
      email: form.email.toLowerCase().trim(),
      docType: form.docType,
      docNumber: form.docNumber.trim(),
      locale: form.locale,
    };

    const finalQty = isIndividual ? (Number(quantity) || 1) : 1;

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
        setSubmitError(data.error || 'Error al procesar la venta.');
        setLoadingSale(false);
        return;
      }

      const siteUrl = window.location.origin;
      const qrUrl = `${siteUrl}/api/qrs/${data.orderId}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

      setModalData({
        orderId: data.orderId,
        buyerName: buyerInfo.name,
        buyerEmail: buyerInfo.email,
        ticketName: selectedTicket?.stock === undefined
          ? `${selectedTicket?.name || 'Mesa'} #${selectedTicket?.number}`
          : selectedTicket?.name || 'Boleta',
        qrUrl,
        qrImageUrl,
        isIndividual,
        quantity: finalQty,
        locale: form.locale,
      });
      setShowSuccessModal(true);
      setLoadingSale(false);
      fetchResumenData();

    } catch (err) {
      console.error('Error submitting quick sell:', err);
      setSubmitError('Error de red al procesar el registro.');
      setLoadingSale(false);
    }
  }

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
    setShowSuccessModal(false);
    setModalData(null);
    setErrors({});
  }

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
      <div className="min-h-screen bg-[#F3F0E8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#5A6046] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-[#26261F] text-sm">Verificando sesión...</p>
      </div>
    );
  }

  // Calculate comparisons stats for Colombiamoda & Entre Soles
  const edColombiamoda = editionsComparison.find(e => e.slug === 'colombiamoda') || {
    totalRevenue: 220630000,
    totalSold: 99,
    totalOrders: 99,
    totalCheckIns: 302,
  };
  const edEntreSoles = editionsComparison.find(e => e.slug === 'entre-soles') || {
    totalRevenue: resumenStats.totalRevenue,
    totalSold: resumenStats.totalSold,
    totalOrders: resumenStats.totalOrders,
    totalCheckIns: resumenStats.totalCheckIns,
  };

  const avgTicketColombiamoda = edColombiamoda.totalSold > 0 ? Math.round(edColombiamoda.totalRevenue / edColombiamoda.totalSold) : 0;
  const avgTicketEntreSoles = edEntreSoles.totalSold > 0 ? Math.round(edEntreSoles.totalRevenue / edEntreSoles.totalSold) : 0;
  const comparePercentage = edColombiamoda.totalRevenue > 0 ? Math.round((edEntreSoles.totalRevenue / edColombiamoda.totalRevenue) * 100) : 0;

  return (
    <>
      {/* Import Google Fonts Fraunces & Inter */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Complete CSS Palette & Design Tokens matching the HTML design */}
      <style jsx global>{`
        :root {
          --olive-900: #333726;
          --olive-800: #454A34;
          --olive-700: #5A6046;
          --olive-500: #7C8265;
          --olive-200: #C9CDBB;
          --cream: #F3F0E8;
          --cream-deep: #EAE5D8;
          --surface: #FFFFFF;
          --line: #E3DDCD;
          --line-soft: #EFEADC;
          --bronze: #8A6B31;
          --bronze-soft: #F6EEDC;
          --ink: #26261F;
          --ink-2: #6A695C;
          --ink-3: #96958A;
          --ok: #4B7A50;
          --ok-soft: #E7F0E6;
          --warn: #B07D1E;
          --warn-soft: #FAF0D8;
          --sold: #B24A34;
          --sold-soft: #F8E7E2;
          --r-control: 5px;
          --r-surface: 10px;
          --shadow: 0 1px 2px rgba(51,55,38,.06), 0 8px 24px -16px rgba(51,55,38,.35);
        }

        .num {
          font-family: Fraunces, Georgia, serif;
          font-variant-numeric: tabular-nums;
          letter-spacing: -.01em;
        }

        .app {
          display: grid;
          grid-template-columns: 236px 1fr;
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        /* ---------- Rail ---------- */
        .rail {
          background: var(--olive-700);
          color: #EDEBE0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 30;
        }
        .brand {
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .brand .mark {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          opacity: .85;
        }
        .brand .mark span {
          font-size: 15px;
        }
        .brand h1 {
          font-family: Fraunces, Georgia, serif;
          font-weight: 500;
          font-size: 19px;
          margin: 0;
          letter-spacing: .02em;
          color: #fff;
        }
        .brand p {
          margin: 2px 0 0;
          font-size: 11.5px;
          color: rgba(237,235,224,.6);
        }
        .nav {
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav .group {
          font-size: 10.5px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(237,235,224,.45);
          padding: 14px 10px 6px;
        }
        .nav button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 10px;
          border-radius: var(--r-control);
          color: rgba(237,235,224,.82);
          font-size: 13.5px;
          text-align: left;
          transition: background .12s ease, color .12s ease;
          border: 0;
          background: none;
          cursor: pointer;
        }
        .nav button:hover {
          background: rgba(255,255,255,.07);
          color: #fff;
        }
        .nav button[aria-current="page"] {
          background: var(--olive-900);
          color: #fff;
          font-weight: 500;
        }
        .nav .ic {
          width: 16px;
          height: 16px;
          flex: none;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.6;
        }
        .nav .count {
          margin-left: auto;
          font-size: 11.5px;
          color: rgba(237,235,224,.55);
        }
        .rail-foot {
          margin-top: auto;
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,.1);
        }
        .edition-card {
          background: rgba(0,0,0,.16);
          border-radius: var(--r-surface);
          padding: 12px;
        }
        .edition-card .lbl {
          font-size: 10.5px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(237,235,224,.5);
        }
        .edition-card .name {
          font-family: Fraunces, Georgia, serif;
          font-size: 16px;
          color: #fff;
          margin-top: 3px;
        }
        .edition-card .live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #CFE0C6;
          margin-top: 4px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8FC28A;
          box-shadow: 0 0 0 3px rgba(143,194,138,.2);
        }
        .edition-card button {
          margin-top: 10px;
          width: 100%;
          justify-content: center;
          display: flex;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: var(--r-control);
          padding: 7px;
          font-size: 12.5px;
          color: #fff;
          background: none;
          cursor: pointer;
        }
        .edition-card button:hover {
          background: rgba(255,255,255,.1);
        }
        .signout {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 2px 0;
          font-size: 12.5px;
          color: rgba(237,235,224,.55);
          background: none;
          border: 0;
          cursor: pointer;
        }
        .signout:hover {
          color: #fff;
        }

        /* ---------- Main & Topbar ---------- */
        .main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(243,240,232,.88);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line);
          padding: 16px 28px;
          display: flex;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
        }
        .topbar h2 {
          font-family: Fraunces, Georgia, serif;
          font-weight: 500;
          font-size: 22px;
          margin: 0;
          letter-spacing: -.01em;
        }
        .topbar .sub {
          font-size: 12.5px;
          color: var(--ink-2);
          margin-top: 2px;
        }
        .topbar .actions {
          margin-left: auto;
          display: flex;
          gap: 8px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: var(--r-control);
          font-size: 13px;
          font-weight: 500;
          transition: background .12s ease, border-color .12s ease;
          border: 0;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--olive-700);
          color: #fff;
        }
        .btn-primary:hover {
          background: var(--olive-800);
        }
        .btn-ghost {
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
        }
        .btn-ghost:hover {
          border-color: var(--olive-200);
          background: #fff;
        }
        .btn-bronze {
          background: var(--bronze);
          color: #fff;
        }
        .btn-bronze:hover {
          background: #775B29;
        }
        .btn-lg {
          padding: 12px 18px;
          font-size: 14px;
          width: 100%;
          justify-content: center;
        }

        .view {
          padding: 24px 28px 48px;
          display: none;
        }
        .view.is-active {
          display: block;
        }
        .stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ---------- Surfaces ---------- */
        .card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--r-surface);
          box-shadow: var(--shadow);
        }
        .card-head {
          padding: 16px 20px;
          border-bottom: 1px solid var(--line-soft);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .card-head h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: .005em;
        }
        .card-head p {
          margin: 2px 0 0;
          font-size: 12.5px;
          color: var(--ink-2);
        }
        .card-head .right {
          margin-left: auto;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .card-body {
          padding: 20px;
        }

        /* ---------- Resumen Metrics ---------- */
        .hero {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 20px;
        }
        .money {
          padding: 24px;
        }
        .money .lbl {
          font-size: 12.5px;
          color: var(--ink-2);
        }
        .money .big {
          font-family: Fraunces, Georgia, serif;
          font-size: 46px;
          line-height: 1.05;
          font-weight: 500;
          margin: 6px 0 0;
          font-variant-numeric: tabular-nums;
          letter-spacing: -.02em;
        }
        .money .cur {
          font-size: 18px;
          color: var(--ink-3);
          margin-left: 6px;
          letter-spacing: 0;
        }
        .trend {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 12.5px;
          color: var(--ink-2);
        }
        .trend b {
          color: var(--ok);
          font-weight: 600;
        }
        .split {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--line-soft);
        }
        .split div {
          padding: 16px 24px;
          border-right: 1px solid var(--line-soft);
        }
        .split div:last-child {
          border-right: 0;
        }
        .split .k {
          font-size: 12px;
          color: var(--ink-2);
        }
        .split .v {
          font-family: Fraunces, Georgia, serif;
          font-size: 22px;
          font-variant-numeric: tabular-nums;
          margin-top: 2px;
        }

        /* Ocupación por zona */
        .zone {
          display: grid;
          grid-template-columns: 96px 1fr 56px;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .zone:last-child {
          border-bottom: 0;
        }
        .zone .z-name {
          font-size: 13px;
          font-weight: 500;
        }
        .zone .z-sub {
          font-size: 11.5px;
          color: var(--ink-3);
        }
        .bar {
          height: 8px;
          background: var(--cream-deep);
          border-radius: 99px;
          overflow: hidden;
          display: flex;
        }
        .bar i {
          display: block;
          height: 100%;
        }
        .bar .sold {
          background: var(--olive-700);
        }
        .bar .held {
          background: #D9B45F;
        }
        .zone .z-val {
          text-align: right;
          font-family: Fraunces, Georgia, serif;
          font-size: 14px;
          font-variant-numeric: tabular-nums;
        }
        .legend {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--ink-2);
          margin-top: 14px;
        }
        .legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .sw {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          display: inline-block;
        }

        /* ---------- Comparativa ---------- */
        .compare {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .compare > div {
          padding: 20px;
        }
        .compare > div:first-child {
          border-right: 1px solid var(--line-soft);
        }
        .compare .ed {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .compare .ed h4 {
          margin: 0;
          font-family: Fraunces, Georgia, serif;
          font-size: 17px;
          font-weight: 500;
        }
        .kv {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed var(--line-soft);
          font-size: 13px;
        }
        .kv:last-child {
          border-bottom: 0;
        }
        .kv span {
          color: var(--ink-2);
        }
        .kv b {
          font-family: Fraunces, Georgia, serif;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        /* ---------- Pills ---------- */
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 500;
          line-height: 1.7;
        }
        .pill-ok { background: var(--ok-soft); color: var(--ok); }
        .pill-warn { background: var(--warn-soft); color: var(--warn); }
        .pill-sold { background: var(--sold-soft); color: var(--sold); }
        .pill-muted { background: var(--cream-deep); color: var(--ink-2); }
        .pill-bronze { background: var(--bronze-soft); color: var(--bronze); }

        /* ---------- Formulario ---------- */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: start;
        }
        .fieldset {
          padding: 20px;
          border-bottom: 1px solid var(--line-soft);
        }
        .fieldset:last-child {
          border-bottom: 0;
        }
        .fieldset h4 {
          margin: 0 0 2px;
          font-size: 13.5px;
          font-weight: 600;
        }
        .fieldset .hint {
          margin: 0 0 16px;
          font-size: 12.5px;
          color: var(--ink-2);
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .row-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .field:last-child {
          margin-bottom: 0;
        }
        label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink);
        }
        input, select {
          width: 100%;
          padding: 9px 11px;
          font: inherit;
          font-size: 13.5px;
          border: 1px solid var(--line);
          border-radius: var(--r-control);
          background: #fff;
          color: var(--ink);
          transition: border-color .12s ease, box-shadow .12s ease;
        }
        input::placeholder { color: var(--ink-3); }
        input:focus, select:focus {
          border-color: var(--olive-500);
          box-shadow: 0 0 0 3px rgba(124,130,101,.15);
          outline: none;
        }
        .help {
          font-size: 11.5px;
          color: var(--ink-3);
        }
        .seg {
          display: inline-flex;
          border: 1px solid var(--line);
          border-radius: var(--r-control);
          overflow: hidden;
        }
        .seg button {
          padding: 8px 16px;
          font-size: 13px;
          color: var(--ink-2);
          border: 0;
          background: none;
          cursor: pointer;
        }
        .seg button[aria-pressed="true"] {
          background: var(--olive-700);
          color: #fff;
          font-weight: 500;
        }
        .stepper {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--line);
          border-radius: var(--r-control);
          overflow: hidden;
        }
        .stepper button {
          width: 34px;
          height: 36px;
          font-size: 16px;
          color: var(--ink-2);
          background: #fff;
          border: 0;
          cursor: pointer;
        }
        .stepper button:hover { background: var(--cream); }
        .stepper input {
          width: 52px;
          text-align: center;
          border: 0;
          border-left: 1px solid var(--line);
          border-right: 1px solid var(--line);
          border-radius: 0;
        }
        .summary {
          position: sticky;
          top: 96px;
        }
        .summary .line {
          display: flex;
          justify-content: space-between;
          padding: 9px 0;
          font-size: 13px;
          border-bottom: 1px dashed var(--line-soft);
        }
        .summary .line span { color: var(--ink-2); }
        .summary .total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 14px 0 4px;
        }
        .summary .total b {
          font-family: Fraunces, Georgia, serif;
          font-size: 26px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }
        .note {
          background: var(--bronze-soft);
          border: 1px solid #EADCC0;
          border-radius: var(--r-control);
          padding: 10px 12px;
          font-size: 12.5px;
          color: #6E5623;
          margin-top: 14px;
        }

        /* ---------- Mapa ---------- */
        .map-shell {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ---------- Tabla ---------- */
        .filters {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--line-soft);
          flex-wrap: wrap;
        }
        .search {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 340px;
        }
        .search input {
          padding-left: 32px;
        }
        .search svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          stroke: var(--ink-3);
          fill: none;
          stroke-width: 1.7;
          width: 14px;
          height: 14px;
        }
        .filters select {
          width: auto;
          min-width: 130px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead th {
          text-align: left;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-2);
          padding: 10px 16px;
          background: var(--cream);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
        }
        tbody td {
          padding: 13px 16px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 13px;
          vertical-align: middle;
        }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #FBFAF6; }
        .who {
          display: flex;
          flex-direction: column;
        }
        .who b { font-weight: 500; }
        .who span { font-size: 12px; color: var(--ink-3); }
        .ord { font-size: 11.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
        .amt {
          text-align: right;
          font-family: Fraunces, Georgia, serif;
          font-variant-numeric: tabular-nums;
          font-size: 13.5px;
        }
        .rowact {
          opacity: 0.85;
          transition: opacity .12s ease;
          font-size: 12px;
          color: var(--bronze);
          font-weight: 500;
          background: none;
          border: 1px solid var(--line);
          padding: 4px 8px;
          border-radius: var(--r-control);
          cursor: pointer;
        }
        tr:hover .rowact { opacity: 1; background: var(--surface); }
        .tfoot {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          font-size: 12.5px;
          color: var(--ink-2);
        }
        .pager {
          margin-left: auto;
          display: flex;
          gap: 4px;
        }
        .pager button {
          min-width: 30px;
          height: 30px;
          border: 1px solid var(--line);
          border-radius: var(--r-control);
          background: #fff;
          font-size: 12.5px;
          cursor: pointer;
        }
        .pager button[aria-current="true"] {
          background: var(--olive-700);
          border-color: var(--olive-700);
          color: #fff;
        }

        /* ---------- Diálogo ---------- */
        .scrim {
          position: fixed;
          inset: 0;
          background: rgba(38,38,31,.45);
          display: none;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 50;
        }
        .scrim.is-open { display: flex; }
        .dialog {
          background: var(--surface);
          border-radius: 12px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 24px 60px -20px rgba(38,38,31,.5);
          overflow: hidden;
        }
        .dialog header {
          padding: 18px 22px;
          border-bottom: 1px solid var(--line-soft);
          display: flex;
          align-items: center;
        }
        .dialog header h3 {
          margin: 0;
          font-family: Fraunces, Georgia, serif;
          font-weight: 500;
          font-size: 18px;
        }
        .dialog header button {
          margin-left: auto;
          color: var(--ink-3);
          font-size: 18px;
          line-height: 1;
          background: none;
          border: 0;
          cursor: pointer;
        }
        .dialog .body { padding: 22px; }
        .ed-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border: 1px solid var(--line);
          border-radius: var(--r-control);
          margin-bottom: 8px;
        }
        .ed-row.active {
          border-color: var(--bronze);
          background: var(--bronze-soft);
        }
        .ed-row .nm { font-weight: 500; font-size: 13.5px; }
        .ed-row .sl { font-size: 11.5px; color: var(--ink-3); }
        .ed-row .rt { margin-left: auto; }
        .danger {
          border: 1px solid #E6D3B4;
          background: #FBF6EA;
          border-radius: var(--r-control);
          padding: 16px;
          margin-top: 18px;
        }
        .danger h5 { margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #6E5623; }
        .danger p { margin: 0 0 12px; font-size: 12.5px; color: #7A6535; line-height: 1.55; }
        .dialog footer {
          padding: 14px 22px;
          border-top: 1px solid var(--line-soft);
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        @media (max-width: 1080px) {
          .hero, .form-grid, .compare { grid-template-columns: 1fr; }
          .summary { position: static; }
        }
        @media (max-width: 860px) {
          .app { grid-template-columns: 1fr; }
          .rail { position: static; height: auto; flex-direction: row; align-items: center; overflow-x: auto; }
          .rail-foot, .brand p, .nav .group { display: none; }
          .nav { flex-direction: row; padding: 10px; }
          .brand { border-bottom: 0; border-right: 1px solid rgba(255,255,255,.1); padding: 14px 16px; }
          .view, .topbar { padding-left: 16px; padding-right: 16px; }
          .row, .row-3, .split { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="app">
        
        {/* ============ RAIL (LEFT SIDEBAR) ============ */}
        <aside className="rail">
          <div className="brand">
            <div className="mark">
              <span>&#9752;</span><span>&#10047;</span><span>&#9752;</span>
            </div>
            <h1>Boho Sunday</h1>
            <p>Venta y gestión de tickets</p>
          </div>

          <nav className="nav">
            <div className="group">Operación</div>
            <button
              type="button"
              data-view="resumen"
              aria-current={activeView === 'resumen' ? 'page' : undefined}
              onClick={() => setActiveView('resumen')}
            >
              <svg className="ic" viewBox="0 0 24 24"><path d="M3 13h6V3H3zM15 21h6V11h-6zM3 21h6v-4H3zM15 7h6V3h-6z"/></svg>
              Resumen
            </button>

            <button
              type="button"
              data-view="venta"
              aria-current={activeView === 'venta' ? 'page' : undefined}
              onClick={() => setActiveView('venta')}
            >
              <svg className="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Registrar venta
            </button>

            <button
              type="button"
              data-view="mapa"
              aria-current={activeView === 'mapa' ? 'page' : undefined}
              onClick={() => setActiveView('mapa')}
            >
              <svg className="ic" viewBox="0 0 24 24"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15"/></svg>
              Mapa de mesas
            </button>

            <button
              type="button"
              data-view="compras"
              aria-current={activeView === 'compras' ? 'page' : undefined}
              onClick={() => setActiveView('compras')}
            >
              <svg className="ic" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              Compras <span className="count">{purchasedTotal > 0 ? purchasedTotal : ''}</span>
            </button>
          </nav>

          <div className="rail-foot">
            <div className="edition-card">
              <div className="lbl">Edición en venta</div>
              <div className="name">{activeEdition?.name || 'Entre Soles'}</div>
              <div className="live"><i className="dot"></i> Recibiendo ventas en la web</div>
              <button type="button" onClick={() => setShowEditionsModal(true)}>Cambiar edición</button>
            </div>
            <button type="button" className="signout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </aside>

        {/* ============ MAIN CONTENT AREA ============ */}
        <div className="main">

          {/* ---------- 1. RESUMEN VIEW ---------- */}
          <div className={`view ${activeView === 'resumen' ? 'is-active' : ''}`} id="v-resumen">
            <header className="topbar" style={{ margin: '-24px -28px 24px' }}>
              <div>
                <h2>Resumen de la edición</h2>
                <div className="sub">
                  {activeEdition?.name || 'Entre Soles'} · datos en vivo{lastUpdatedTime ? `, actualizado a las ${lastUpdatedTime}` : ''}
                </div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={downloadMetricsPDF}>Descargar reporte</button>
                <button type="button" className="btn btn-primary" onClick={() => setActiveView('venta')}>Registrar venta</button>
              </div>
            </header>

            <div className="stack">
              <section className="hero">
                {/* Money & General Totals Card */}
                <div className="card">
                  <div className="money">
                    <div className="lbl">Recaudado en {activeEdition?.name || 'Entre Soles'}</div>
                    <div className="big">
                      ${resumenStats.totalRevenue.toLocaleString('es-CO')}<span className="cur">COP</span>
                    </div>
                    {comparePercentage > 0 && (
                      <div className="trend">
                        <b>{comparePercentage}%</b> de lo recaudado por Colombiamoda a esta altura
                      </div>
                    )}
                  </div>
                  <div className="split">
                    <div>
                      <div className="k">Boletas vendidas</div>
                      <div className="v">{resumenStats.totalSold}</div>
                    </div>
                    <div>
                      <div className="k">Órdenes</div>
                      <div className="v">{resumenStats.totalOrders}</div>
                    </div>
                    <div>
                      <div className="k">Check-ins</div>
                      <div className="v">{resumenStats.totalCheckIns}</div>
                    </div>
                  </div>
                </div>

                {/* Ocupación por zona Card */}
                <div className="card">
                  <div className="card-head">
                    <div>
                      <h3>Ocupación por zona</h3>
                      <p>
                        {zoneStats.reduce((sum, z) => sum + z.sold, 0)} de {zoneStats.reduce((sum, z) => sum + z.total, 0)} mesas comprometidas
                      </p>
                    </div>
                    <div className="right">
                      <button type="button" className="btn btn-ghost" onClick={() => setActiveView('mapa')}>Ver mapa</button>
                    </div>
                  </div>
                  <div className="card-body" style={{ paddingTop: '6px' }}>
                    {resumenLoading ? (
                      <div className="py-6 text-center text-xs text-[#6A695C]">Cargando ocupación por zona...</div>
                    ) : zoneStats.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#6A695C]">No hay mesas configuradas</div>
                    ) : (
                      zoneStats.map((z) => {
                        const percentSold = z.total > 0 ? Math.round((z.sold / z.total) * 100) : 0;
                        return (
                          <div className="zone" key={z.zone}>
                            <div>
                              <div className="z-name">{z.name}</div>
                              <div className="z-sub">{z.total} {z.zone === 'bohemian' ? 'camas' : 'mesas'}</div>
                            </div>
                            <div className="bar">
                              <i className="sold" style={{ width: `${percentSold}%` }}></i>
                            </div>
                            <div className="z-val">{z.sold}/{z.total}</div>
                          </div>
                        );
                      })
                    )}

                    <div className="legend">
                      <span><i className="sw" style={{ background: 'var(--olive-700)' }}></i> Vendida</span>
                      <span><i className="sw" style={{ background: '#D9B45F' }}></i> Bloqueada</span>
                      <span><i className="sw" style={{ background: 'var(--cream-deep)' }}></i> Disponible</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Multi-Edition Comparison Section */}
              <section className="card">
                <div className="card-head">
                  <div>
                    <h3>Comparativa entre ediciones</h3>
                    <p>Rendimiento acumulado de Colombiamoda frente a Entre Soles</p>
                  </div>
                  <div className="right">
                    <button type="button" className="btn btn-ghost" onClick={downloadMetricsPDF}>Exportar PDF</button>
                  </div>
                </div>
                <div className="compare">
                  <div>
                    <div className="ed">
                      <h4>Colombiamoda</h4>
                      <span className="pill pill-muted">Archivada</span>
                    </div>
                    <div className="kv"><span>Recaudado</span><b>${edColombiamoda.totalRevenue.toLocaleString('es-CO')}</b></div>
                    <div className="kv"><span>Boletas vendidas</span><b>{edColombiamoda.totalSold}</b></div>
                    <div className="kv"><span>Órdenes procesadas</span><b>{edColombiamoda.totalOrders}</b></div>
                    <div className="kv"><span>Check-ins</span><b>{edColombiamoda.totalCheckIns}</b></div>
                    <div className="kv"><span>Ticket promedio</span><b>${avgTicketColombiamoda.toLocaleString('es-CO')}</b></div>
                  </div>

                  <div style={{ background: '#FCFBF7' }}>
                    <div className="ed">
                      <h4>Entre Soles</h4>
                      <span className="pill pill-bronze">
                        <i className="dot" style={{ background: 'var(--bronze)', boxShadow: 'none' }}></i> En venta
                      </span>
                    </div>
                    <div className="kv"><span>Recaudado</span><b>${edEntreSoles.totalRevenue.toLocaleString('es-CO')}</b></div>
                    <div className="kv"><span>Boletas vendidas</span><b>{edEntreSoles.totalSold}</b></div>
                    <div className="kv"><span>Órdenes procesadas</span><b>{edEntreSoles.totalOrders}</b></div>
                    <div className="kv"><span>Check-ins</span><b>{edEntreSoles.totalCheckIns}</b></div>
                    <div className="kv"><span>Ticket promedio</span><b>${avgTicketEntreSoles.toLocaleString('es-CO')}</b></div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ---------- 2. REGISTRAR VENTA VIEW ---------- */}
          <div className={`view ${activeView === 'venta' ? 'is-active' : ''}`} id="v-venta">
            <header className="topbar" style={{ margin: '-24px -28px 24px' }}>
              <div>
                <h2>Registrar venta</h2>
                <div className="sub">La entrada se genera y se envía por correo al confirmar</div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={() => setActiveView('compras')}>Ver compras</button>
              </div>
            </header>

            <div className="form-grid">
              <form onSubmit={handleRegisterSale} className="card">
                
                {submitError && (
                  <div style={{ padding: '16px 20px', background: '#F8E7E2', borderBottom: '1px solid var(--line)', color: 'var(--sold)', fontSize: '13px' }}>
                    {submitError}
                  </div>
                )}

                {/* Producto Fieldset */}
                <div className="fieldset">
                  <h4>Producto</h4>
                  <p className="hint">La etapa define el precio que se cobra en esta venta.</p>
                  
                  <div className="row">
                    <div className="field">
                      <label htmlFor="etapa">Etapa del evento</label>
                      <select
                        id="etapa"
                        value={selectedStageId}
                        onChange={(e) => setSelectedStageId(e.target.value)}
                      >
                        <option value="">Precios Base (Sin Etapa)</option>
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}{s.id === activeStageId ? ' — vigente hoy' : ''}
                          </option>
                        ))}
                      </select>
                      <span className="help">Cambiar la etapa afecta solo a esta venta.</span>
                    </div>

                    <div className="field">
                      <label htmlFor="boleta">Boleta o mesa</label>
                      <select
                        id="boleta"
                        value={selectedTicketId}
                        onChange={(e) => {
                          setSelectedTicketId(e.target.value);
                          setQuantity(1);
                        }}
                      >
                        {fetchingTickets ? (
                          <option value="">Cargando boletería...</option>
                        ) : tickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — ${t.price.toLocaleString('es-CO')} {t.stock !== undefined ? `· ${(t as any).remaining ?? t.stock} disponibles` : `(Cama #${t.number})`}
                          </option>
                        ))}
                      </select>
                      {errors.ticket && <span className="help" style={{ color: 'var(--sold)' }}>{errors.ticket}</span>}
                    </div>
                  </div>

                  {isIndividual && (
                    <div className="field">
                      <label htmlFor="cant">Cantidad</label>
                      <div className="stepper">
                        <button
                          type="button"
                          aria-label="Quitar una"
                          onClick={() => setQuantity((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                        >
                          &minus;
                        </button>
                        <input
                          id="cant"
                          value={quantity}
                          inputMode="numeric"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setQuantity('');
                            else {
                              const parsed = parseInt(val, 10);
                              setQuantity(isNaN(parsed) ? '' : parsed);
                            }
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Agregar una"
                          onClick={() => setQuantity((prev) => (Number(prev) || 0) + 1)}
                        >
                          +
                        </button>
                      </div>
                      {errors.quantity && <span className="help" style={{ color: 'var(--sold)' }}>{errors.quantity}</span>}
                    </div>
                  )}
                </div>

                {/* Comprador Fieldset */}
                <div className="fieldset">
                  <h4>Comprador</h4>
                  <p className="hint">Estos datos se imprimen en la entrada y se usan para el check-in.</p>
                  
                  <div className="field">
                    <label htmlFor="nom">Nombre completo</label>
                    <input
                      id="nom"
                      placeholder="Como aparece en el documento"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <span className="help" style={{ color: 'var(--sold)' }}>{errors.name}</span>}
                  </div>

                  <div className="row">
                    <div className="field">
                      <label htmlFor="tdoc">Tipo de documento</label>
                      <select
                        id="tdoc"
                        value={form.docType}
                        onChange={(e) => setForm({ ...form, docType: e.target.value })}
                      >
                        <option value="C.C">Cédula de ciudadanía</option>
                        <option value="C.E">Cédula de extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="DNI">DNI Documento Nacional</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="ndoc">Número de documento</label>
                      <input
                        id="ndoc"
                        placeholder="1020304050"
                        value={form.docNumber}
                        onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                      />
                      {errors.docNumber && <span className="help" style={{ color: 'var(--sold)' }}>{errors.docNumber}</span>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label htmlFor="ind">País / Indicativo</label>
                      <AdminPrefixDropdown
                        value={form.phonePrefix}
                        onChange={(prefix) => setForm({ ...form, phonePrefix: prefix })}
                        currentLocale={currentLocale}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="tel">Teléfono</label>
                      <input
                        id="tel"
                        placeholder="300 123 4567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      {errors.phone && <span className="help" style={{ color: 'var(--sold)' }}>{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label htmlFor="mail">Correo electrónico</label>
                      <input
                        id="mail"
                        placeholder="nombre@correo.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                      {errors.email && <span className="help" style={{ color: 'var(--sold)' }}>{errors.email}</span>}
                    </div>

                    <div className="field">
                      <label htmlFor="mail2">Confirmar correo</label>
                      <input
                        id="mail2"
                        placeholder="nombre@correo.com"
                        value={form.confirmEmail}
                        onChange={(e) => setForm({ ...form, confirmEmail: e.target.value })}
                      />
                      <span className="help">El QR llega a esta dirección.</span>
                      {errors.confirmEmail && <span className="help" style={{ color: 'var(--sold)' }}>{errors.confirmEmail}</span>}
                    </div>
                  </div>

                  <div className="field">
                    <label>Idioma de las notificaciones</label>
                    <div className="seg">
                      <button
                        type="button"
                        aria-pressed={form.locale === 'es'}
                        onClick={() => setForm({ ...form, locale: 'es' })}
                      >
                        Español
                      </button>
                      <button
                        type="button"
                        aria-pressed={form.locale === 'en'}
                        onClick={() => setForm({ ...form, locale: 'en' })}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Search Buyer & Resend / Download QR */}
                <div className="fieldset" style={{ background: '#FAF8F5' }}>
                  <h4>Buscar un comprador existente</h4>
                  <p className="hint">Encuentra a alguien por nombre o correo para reenviarle o descargar sus entradas.</p>
                  
                  <div className="search" style={{ maxWidth: 'none' }}>
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                    <input
                      placeholder="Nombre o correo del comprador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Autocomplete dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div style={{ marginTop: '8px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-control)', maxHeight: '200px', overflowY: 'auto' }}>
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
                          style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}
                        >
                          <div style={{ fontWeight: '500' }}>{result.buyerName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-2)' }}>
                            {result.buyerEmail} · {result.ticketName} {result.ticketNumber ? `#${result.ticketNumber}` : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected User Details Card */}
                  {selectedUser && (
                    <div style={{ marginTop: '16px', padding: '14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-control)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <b>{selectedUser.buyerName}</b>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(null)}
                          style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--sold)', cursor: 'pointer' }}
                        >
                          Limpiar
                        </button>
                      </div>
                      <div className="kv"><span>Correo</span><b>{selectedUser.buyerEmail}</b></div>
                      <div className="kv"><span>Entrada</span><b>{selectedUser.ticketName} {selectedUser.ticketNumber ? `#${selectedUser.ticketNumber}` : ''}</b></div>
                      <div className="kv"><span>Orden</span><b>{selectedUser.orderId}</b></div>
                      
                      {resendStatus && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: resendStatus.type === 'success' ? 'var(--ok)' : 'var(--sold)' }}>
                          {resendStatus.message}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ flex: 1 }}
                          disabled={resending}
                          onClick={() => handleResendQR(selectedUser.orderId)}
                        >
                          {resending ? 'Reenviando...' : 'Reenviar QR'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-bronze"
                          style={{ flex: 1 }}
                          onClick={() => downloadQRImage(selectedUser.orderId, selectedUser.buyerName)}
                        >
                          Descargar QR PNG
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loadingSale}>
                    {loadingSale ? 'Procesando Venta...' : 'Confirmar Venta y Generar QR'}
                  </button>
                </div>
              </form>

              {/* Sticky Summary Card */}
              <div className="card summary">
                <div className="card-head"><h3>Resumen de la venta</h3></div>
                <div className="card-body">
                  <div className="line">
                    <span>{selectedTicket?.name || 'Selecciona ticket'} {isIndividual ? `× ${quantity}` : ''}</span>
                    <b>${totalPrice.toLocaleString('es-CO')}</b>
                  </div>
                  <div className="line">
                    <span>Etapa</span>
                    <b>{stages.find(s => s.id === selectedStageId)?.name || 'Vigente'}</b>
                  </div>
                  <div className="line">
                    <span>Zona</span>
                    <b>{selectedTicket?.zone ? selectedTicket.zone.toUpperCase() : 'General'}</b>
                  </div>
                  <div className="total">
                    <span>Total a cobrar</span>
                    <b>${totalPrice.toLocaleString('es-CO')}</b>
                  </div>
                  
                  <div className="note">
                    {selectedTicket?.stock !== undefined ? (
                      `Quedan ${(selectedTicket as any).remaining ?? selectedTicket.stock} boletas disponibles. Al confirmar se descuenta del inventario.`
                    ) : (
                      `Al confirmar se registra la venta de la mesa #${selectedTicket?.number || ''} y se reserva el aforo.`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- 3. MAPA DE MESAS VIEW ---------- */}
          <div className={`view ${activeView === 'mapa' ? 'is-active' : ''}`} id="v-mapa">
            <header className="topbar" style={{ margin: '-24px -28px 24px' }}>
              <div>
                <h2>Mapa de mesas</h2>
                <div className="sub">Toca una mesa para bloquearla, liberarla o vender en el momento</div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={() => fetchResumenData()}>Actualizar mapa</button>
              </div>
            </header>

            <div className="map-shell">
              <AdminEventMap
                onSelectTicketForSale={(ticketId) => {
                  setSelectedTicketId(ticketId);
                  setActiveView('venta');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewPurchase={(orderId) => {
                  setPurchasedSearch(orderId);
                  setActiveView('compras');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onRefreshStats={() => {
                  fetchResumenData();
                  fetchPurchasedTickets();
                }}
              />
            </div>
          </div>

          {/* ---------- 4. COMPRAS VIEW ---------- */}
          <div className={`view ${activeView === 'compras' ? 'is-active' : ''}`} id="v-compras">
            <header className="topbar" style={{ margin: '-24px -28px 24px' }}>
              <div>
                <h2>Compras</h2>
                <div className="sub">{purchasedTotal} ventas registradas en las ediciones</div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={downloadMetricsPDF}>Exportar PDF</button>
              </div>
            </header>

            <div className="card">
              <div className="filters">
                <div className="search">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                  <input
                    placeholder="Buscar por cliente, correo, orden o ticket..."
                    value={purchasedSearch}
                    onChange={(e) => {
                      setPurchasedSearch(e.target.value);
                      setPurchasedPage(1);
                    }}
                  />
                </div>

                {/* Edition Filter */}
                <select
                  value={selectedEditionFilter}
                  onChange={(e) => {
                    setSelectedEditionFilter(e.target.value);
                    setPurchasedPage(1);
                  }}
                >
                  <option value="all">Todas las ediciones</option>
                  {editions.map((ed) => (
                    <option key={ed.slug} value={ed.slug}>
                      {ed.name} {ed.is_active ? '★' : ''}
                    </option>
                  ))}
                </select>

                {/* Zone Filter */}
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setPurchasedPage(1);
                  }}
                >
                  <option value="all">Todas las zonas</option>
                  {purchasedZones.map((z) => (
                    <option key={z} value={z}>{z.toUpperCase()}</option>
                  ))}
                </select>

                {/* Limit Selector */}
                <select
                  style={{ marginLeft: 'auto' }}
                  value={purchasedLimit}
                  onChange={(e) => {
                    setPurchasedLimit(Number(e.target.value));
                    setPurchasedPage(1);
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              {purchasedError && (
                <div style={{ padding: '12px 20px', color: 'var(--sold)', fontSize: '13px' }}>
                  {purchasedError}
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Comprador</th>
                      <th>Entrada</th>
                      <th>Zona</th>
                      <th>Edición</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasedLoading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                          Cargando registro de ventas...
                        </td>
                      </tr>
                    ) : purchasedList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                          No se encontraron ventas registradas.
                        </td>
                      </tr>
                    ) : (
                      purchasedList.map((item) => (
                        <tr key={item.orderId + item.ticketId}>
                          <td>
                            <div className="who">
                              <b>{item.buyerName}</b>
                              <span>{item.buyerEmail} · {item.buyerPhone}</span>
                              <span className="ord">{item.orderId}</span>
                            </div>
                          </td>
                          <td>
                            {item.ticketName} {item.ticketNumber ? `#${item.ticketNumber}` : ''}
                          </td>
                          <td>
                            <span className="pill pill-muted">{item.zone ? item.zone.toUpperCase() : 'GENERAL'}</span>
                          </td>
                          <td>
                            <span className={`pill ${item.editionSlug === 'entre-soles' ? 'pill-bronze' : 'pill-muted'}`}>
                              {item.editionName || item.editionSlug}
                            </span>
                          </td>
                          <td>
                            {item.accesosRestantes < item.totalAccesos ? (
                              <span className="pill pill-ok">Check-in hecho</span>
                            ) : (
                              <span className="pill pill-warn">Sin check-in</span>
                            )}
                          </td>
                          <td className="amt">
                            ${(Number(item.ticketPrice) || 0).toLocaleString('es-CO')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="rowact"
                                title="Reenviar correo con QR"
                                onClick={() => handleResendQR(item.orderId)}
                              >
                                Reenviar QR
                              </button>
                              <button
                                type="button"
                                className="rowact"
                                title="Descargar imagen QR PNG"
                                onClick={() => downloadQRImage(item.orderId, item.buyerName)}
                              >
                                Descargar QR
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="tfoot">
                <span>
                  {purchasedTotal > 0
                    ? `${(purchasedPage - 1) * purchasedLimit + 1} a ${Math.min(purchasedPage * purchasedLimit, purchasedTotal)} de ${purchasedTotal} ventas`
                    : '0 ventas'}
                </span>
                {purchasedTotalPages > 1 && (
                  <div className="pager">
                    <button
                      type="button"
                      disabled={purchasedPage <= 1}
                      onClick={() => setPurchasedPage(p => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: purchasedTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === purchasedTotalPages || Math.abs(p - purchasedPage) <= 1)
                      .map(p => (
                        <button
                          key={p}
                          type="button"
                          aria-current={p === purchasedPage ? 'true' : undefined}
                          onClick={() => setPurchasedPage(p)}
                        >
                          {p}
                        </button>
                      ))}

                    <button
                      type="button"
                      disabled={purchasedPage >= purchasedTotalPages}
                      onClick={() => setPurchasedPage(p => Math.min(purchasedTotalPages, p + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============ DIÁLOGO EDICIONES (SCRIM MODAL) ============ */}
      <div className={`scrim ${showEditionsModal ? 'is-open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setShowEditionsModal(false);
      }}>
        <div className="dialog" role="dialog" aria-modal="true" aria-label="Ediciones del evento">
          <header>
            <h3>Ediciones del evento</h3>
            <button type="button" onClick={() => setShowEditionsModal(false)} aria-label="Cerrar">&times;</button>
          </header>

          <div className="body">
            <div className="field" style={{ marginBottom: '16px' }}>
              <label>Edición actualmente activa</label>
              <div className="ed-row active">
                <div>
                  <div className="nm">{activeEdition?.name || 'Entre Soles'}</div>
                  <div className="sl">slug: {activeEdition?.slug || 'entre-soles'}</div>
                </div>
                <div className="rt">
                  <span className="pill pill-bronze">En venta</span>
                </div>
              </div>
            </div>

            <div className="field" style={{ marginBottom: '16px' }}>
              <label>Todas las ediciones registradas</label>
              {editions.map((ed) => (
                <div key={ed.slug} className={`ed-row ${ed.is_active ? 'active' : ''}`}>
                  <div>
                    <div className="nm">{ed.name}</div>
                    <div className="sl">{ed.slug}</div>
                  </div>
                  <div className="rt">
                    {ed.is_active ? (
                      <span className="pill pill-bronze">En venta</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleSetActiveEdition(ed.slug)}
                      >
                        Poner en venta
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateEdition} className="field" style={{ marginTop: '18px' }}>
              <label htmlFor="nueva">Crear una nueva edición</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="nueva"
                  placeholder="Ej. Sunset Edition 2026"
                  value={newEditionName}
                  onChange={(e) => setNewEditionName(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 'none' }}
                  disabled={creatingEdition || !newEditionName.trim()}
                >
                  {creatingEdition ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>

            <div className="danger">
              <h5>Reiniciar disponibilidad e inventario</h5>
              <p>
                Todas las mesas vuelven a estar disponibles y el stock de boletería se restablece para que la web venda la edición activa (<strong>{activeEdition?.name || 'Entre Soles'}</strong>). Las ventas pasadas y datos de clientes se conservan 100%.
              </p>
              <button
                type="button"
                className="btn btn-bronze"
                disabled={resettingInventory}
                onClick={handleResetInventory}
              >
                {resettingInventory ? 'Reiniciando...' : 'Reiniciar inventario'}
              </button>
            </div>
          </div>

          <footer>
            <button type="button" className="btn btn-ghost" onClick={() => setShowEditionsModal(false)}>Cerrar</button>
          </footer>
        </div>
      </div>

      {/* ============ SUCCESS MODAL ON SALE REGISTRATION ============ */}
      {showSuccessModal && modalData && (
        <div className="scrim is-open" onClick={(e) => {
          if (e.target === e.currentTarget) setShowSuccessModal(false);
        }}>
          <div className="dialog" style={{ maxWidth: '440px', textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--ok-soft)', color: 'var(--ok)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px' }}>
              ✓
            </div>

            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', margin: '0 0 4px' }}>¡VENTA REGISTRADA!</h3>
            <p style={{ fontSize: '12px', color: 'var(--ink-2)', margin: '0 0 16px' }}>La entrada se ha generado y enviado por correo.</p>

            <div style={{ textAlign: 'left', background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 'var(--r-control)', padding: '14px', marginBottom: '16px' }}>
              <div className="kv"><span>Cliente</span><b>{modalData.buyerName}</b></div>
              <div className="kv"><span>Producto</span><b>{modalData.ticketName}</b></div>
              <div className="kv"><span>Cantidad</span><b>{modalData.quantity}</b></div>
              <div className="kv"><span>Correo</span><b>{modalData.buyerEmail}</b></div>
              <div className="kv"><span>Orden</span><b>{modalData.orderId}</b></div>
            </div>

            <div style={{ background: '#EAE5D8', padding: '12px', borderRadius: 'var(--r-control)', display: 'inline-block', marginBottom: '16px' }}>
              <img src={modalData.qrImageUrl} alt="Código QR" width={160} height={160} style={{ borderRadius: '4px', background: '#fff', padding: '4px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ background: '#25D366' }}
                onClick={handleShareWhatsApp}
              >
                Compartir por WhatsApp
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={handleCopyQR}
                >
                  Copiar Link QR
                </button>
                <button
                  type="button"
                  className="btn btn-bronze"
                  style={{ flex: 1 }}
                  onClick={() => downloadQRImage(modalData.orderId, modalData.buyerName)}
                >
                  Descargar QR
                </button>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: '4px' }}
                onClick={handleResetForm}
              >
                Registrar Otra Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── AdminPrefixDropdown Component ─────────────────────────────────────────────
function AdminPrefixDropdown({
  value,
  onChange,
  currentLocale,
}: {
  value: string;
  onChange: (v: string) => void;
  currentLocale: 'es' | 'en';
}) {
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!open) return;
    const clickHandler = () => setOpen(false);
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [open]);

  useEffect(() => {
    if (!open) setFilterText('');
  }, [open]);

  const selectedCountry = sortedCountries.find((c) => `+${c.phoneCode.replace(/\s+/g, '')}` === value) || sortedCountries[0];
  const selectedEmoji = getFlagEmoji(selectedCountry.iso2);

  const filteredCountries = sortedCountries.filter((c) => {
    const term = filterText.toLowerCase();
    const name = currentLocale === 'en' ? c.nameEN : c.nameES;
    return (
      name.toLowerCase().includes(term) ||
      c.phoneCode.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        style={{
          width: '100%',
          padding: '9px 11px',
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-control)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13.5px',
          color: 'var(--ink)',
          cursor: 'pointer',
        }}
      >
        <span>
          {selectedEmoji} {currentLocale === 'en' ? selectedCountry.nameEN : selectedCountry.nameES} ({value})
        </span>
        <span style={{ fontSize: '10px', color: 'var(--ink-3)' }}>▼</span>
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-control)',
            boxShadow: 'var(--shadow)',
            zIndex: 50,
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '6px', borderBottom: '1px solid var(--line-soft)', position: 'sticky', top: 0, background: '#fff' }}>
            <input
              type="text"
              placeholder="Buscar país..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 8px' }}
              autoFocus
            />
          </div>
          {filteredCountries.length > 0 ? (
            filteredCountries.map((c) => {
              const emoji = getFlagEmoji(c.iso2);
              const code = `+${c.phoneCode.replace(/\s+/g, '')}`;
              const name = currentLocale === 'en' ? c.nameEN : c.nameES;
              return (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '12.5px',
                    border: 0,
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                  }}
                >
                  {emoji} {name} ({code})
                </button>
              );
            })
          ) : (
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--ink-3)' }}>
              Sin resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
