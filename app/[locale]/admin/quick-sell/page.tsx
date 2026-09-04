'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Ticket } from '@/types';
import { jsPDF } from 'jspdf';
import { sortedCountries, getFlagEmoji } from '@/data/countries';
import AdminEventMap from '@/components/eventmap/AdminEventMap';

const customAdminCSS = `
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
    --bronze-light: #B89B5E;
    --ink: #22251B;
    --ink-2: #5F6352;
    --ink-3: #8C907E;
    --sold: #B35A38;
    --ok: #487042;
    --r-control: 10px;
    --r-card: 14px;
    --shadow: 0 4px 20px rgba(51,55,38,0.06);
    --shadow-sm: 0 2px 8px rgba(51,55,38,0.04);
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: var(--cream);
    color: var(--ink);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
  }

  .rail {
    background-color: var(--olive-900);
    color: #E2E5D8;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 20;
  }

  .brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .brand .mark {
    font-size: 12px;
    letter-spacing: 4px;
    color: var(--bronze-light);
    margin-bottom: 6px;
  }
  .brand h1 {
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-weight: 500;
    color: #FFF;
    margin: 0 0 2px;
    letter-spacing: -0.2px;
  }
  .brand p {
    margin: 0;
    font-size: 11px;
    color: #9DA28E;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .nav {
    padding: 16px 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .nav .group {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #7C8268;
    padding: 12px 10px 6px;
    font-weight: 600;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: #C2C7B5;
    text-decoration: none;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: #FFF;
  }
  .nav-item.active {
    background: var(--olive-700);
    color: #FFF;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .nav-item .ic {
    font-size: 15px;
    width: 20px;
    text-align: center;
    opacity: 0.85;
  }
  .nav-item.active .ic { opacity: 1; }
  .nav-item .badge {
    margin-left: auto;
    background: rgba(255,255,255,0.12);
    color: #E2E5D8;
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 10px;
    font-weight: 500;
  }
  .nav-item.active .badge {
    background: var(--bronze-light);
    color: var(--olive-900);
  }

  .rail-foot {
    padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    color: #8A907B;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .rail-foot span { display: flex; align-items: center; gap: 6px; }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #5EC46D;
    box-shadow: 0 0 8px #5EC46D;
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    padding: 16px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .topbar-title { display: flex; align-items: baseline; gap: 12px; }
  .topbar-title h2 {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 500;
    margin: 0;
    color: var(--olive-900);
  }
  .topbar-title .sub {
    font-size: 12.5px;
    color: var(--ink-2);
  }

  .edition-switch {
    display: flex;
    background: var(--cream-deep);
    padding: 3px;
    border-radius: 10px;
    border: 1px solid var(--line);
  }
  .edition-btn {
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: var(--ink-2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .edition-btn.active {
    background: var(--surface);
    color: var(--olive-900);
    box-shadow: var(--shadow-sm);
    font-weight: 600;
  }

  .user-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 6px 5px 12px;
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 500;
  }
  .user-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--olive-700);
    color: #FFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  .view {
    padding: 24px 28px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 14px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--line);
  }
  .stat-card.primary::before { background: var(--olive-700); }
  .stat-card.accent::before { background: var(--bronze); }
  .stat-card.sold::before { background: var(--sold); }

  .stat-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--ink-2);
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .stat-val {
    font-family: 'Fraunces', serif;
    font-size: 26px;
    font-weight: 500;
    color: var(--olive-900);
    line-height: 1.1;
  }
  .stat-sub {
    font-size: 12px;
    color: var(--ink-3);
    margin-top: 6px;
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 20px;
    align-items: start;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    box-shadow: var(--shadow-sm);
  }
  .card-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--line-soft);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-head h3 {
    font-family: 'Fraunces', serif;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    color: var(--olive-900);
  }
  .card-head .meta {
    font-size: 12px;
    color: var(--ink-2);
  }
  .card-body { padding: 20px; }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }
  .form-group {
    margin-bottom: 14px;
  }
  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-2);
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .form-group .help {
    font-size: 11.5px;
    color: var(--ink-3);
    margin-top: 4px;
  }
  .control {
    width: 100%;
    padding: 9px 12px;
    background: #FAF8F5;
    border: 1px solid var(--line);
    border-radius: var(--r-control);
    font-family: inherit;
    font-size: 13.5px;
    color: var(--ink);
    transition: all 0.15s;
  }
  .control:focus {
    outline: none;
    border-color: var(--olive-700);
    background: #FFF;
    box-shadow: 0 0 0 3px rgba(90,96,70,0.12);
  }
  select.control {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%3C5F6352' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--r-control);
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
    text-decoration: none;
  }
  .btn-olive {
    background: var(--olive-900);
    color: #FFF;
  }
  .btn-olive:hover { background: var(--olive-800); }
  .btn-bronze {
    background: var(--bronze);
    color: #FFF;
  }
  .btn-bronze:hover { background: #765B29; }
  .btn-outline {
    background: transparent;
    border-color: var(--line);
    color: var(--olive-900);
  }
  .btn-outline:hover {
    background: var(--cream);
    border-color: var(--olive-500);
  }
  .btn-ghost {
    background: transparent;
    color: var(--ink-2);
  }
  .btn-ghost:hover {
    background: var(--cream);
    color: var(--ink);
  }
  .btn-block { width: 100%; }

  .summary {
    background: #FAF8F5;
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid var(--line);
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 13px;
    color: var(--ink-2);
  }
  .summary-row.total {
    border-top: 1px solid var(--line);
    margin-top: 6px;
    padding-top: 10px;
    font-weight: 600;
    font-size: 15px;
    color: var(--olive-900);
  }

  .table-wrap {
    overflow-x: auto;
  }
  table.tbl {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
  }
  table.tbl th {
    background: #FAF8F5;
    padding: 10px 14px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ink-2);
    font-weight: 600;
    border-bottom: 1px solid var(--line);
  }
  table.tbl td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--line-soft);
    vertical-align: middle;
  }
  table.tbl tr:last-child td { border-bottom: none; }
  table.tbl tr:hover td { background: #FCFBF7; }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .pill-colombia { background: #EAE6D6; color: #50553B; }
  .pill-soles { background: #E6E8D6; color: #3B5542; }
  .pill-general { background: #ECEAE4; color: #606058; }
  .pill-oasis { background: #F0E6D8; color: #78572A; }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
  }
  .status::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .status.ok::before { background: var(--ok); }
  .status.pending::before { background: var(--bronze); }
  .status.sold::before { background: var(--sold); }

  .map-card {
    background: #FCFBF7;
    border: 1px solid var(--line);
    border-radius: var(--r-card);
    padding: 20px;
  }
  .map-legend {
    display: flex;
    gap: 16px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    font-size: 12px;
    color: var(--ink-2);
  }
  .map-legend span { display: flex; align-items: center; gap: 6px; }
  .map-legend .sw {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .filter-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 16px;
    background: #FAF8F5;
    border-bottom: 1px solid var(--line);
    border-radius: var(--r-card) var(--r-card) 0 0;
  }
  .filter-bar .search {
    flex: 1;
    position: relative;
  }
  .filter-bar .search input {
    width: 100%;
    padding: 7px 12px 7px 32px;
    background: #FFF;
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 12.5px;
  }
  .filter-bar .search .ic {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-3);
    font-size: 13px;
  }

  .pg {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--line-soft);
    font-size: 12.5px;
    color: var(--ink-2);
  }
  .pg-btns { display: flex; gap: 4px; }
  .pg-btn {
    padding: 4px 9px;
    border: 1px solid var(--line);
    background: #FFF;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }
  .pg-btn:hover { background: var(--cream); }
  .pg-btn.active { background: var(--olive-700); color: #FFF; border-color: var(--olive-700); }

  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(34, 37, 27, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
  }
  .modal {
    background: #FFF;
    border-radius: 16px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0,0,0,0.18);
    overflow: hidden;
    animation: pop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes pop {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .modal-head {
    padding: 20px 24px;
    background: var(--cream);
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-head h4 {
    font-family: 'Fraunces', serif;
    font-size: 18px;
    margin: 0;
    color: var(--olive-900);
  }
  .modal-body { padding: 24px; text-align: center; }

  .qr-placeholder {
    width: 180px;
    height: 180px;
    margin: 0 auto 16px;
    background: #FFF;
    border: 2px dashed var(--line);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--ink-3);
  }

  .danger {
    background: #FDF6E9;
    border: 1px solid #E6D5B8;
    border-radius: 10px;
    padding: 14px;
    margin-top: 14px;
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
`;

export default function QuickSellPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as 'es' | 'en') || 'es';

  // Navigation View State: 'resumen' | 'venta' | 'mapa' | 'compras' | 'preregistro'
  const [activeView, setActiveView] = useState<'resumen' | 'venta' | 'mapa' | 'compras' | 'preregistro'>('resumen');

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

  // Pre-registers Module State
  const [preRegisterList, setPreRegisterList] = useState<any[]>([]);
  const [preRegisterLoading, setPreRegisterLoading] = useState<boolean>(false);
  const [preRegisterError, setPreRegisterError] = useState<string | null>(null);
  const [preRegisterSearch, setPreRegisterSearch] = useState<string>('');
  const [preRegisterPage, setPreRegisterPage] = useState<number>(1);
  const [preRegisterLimit, setPreRegisterLimit] = useState<number>(10);
  const [preRegisterTotal, setPreRegisterTotal] = useState<number>(0);
  const [preRegisterTotalPages, setPreRegisterTotalPages] = useState<number>(1);

  const fetchPreRegisterData = useCallback(async (
    page = preRegisterPage,
    search = preRegisterSearch,
    limit = preRegisterLimit
  ) => {
    setPreRegisterLoading(true);
    setPreRegisterError(null);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search,
      });

      const res = await fetch(`/api/admin/pre-register?${params.toString()}`, {
        headers: { 'x-admin-token': token },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPreRegisterList(data.data || []);
        setPreRegisterTotal(data.pagination?.total || 0);
        setPreRegisterTotalPages(data.pagination?.totalPages || 1);
      } else {
        setPreRegisterError(data.error || 'Error al cargar pre-registros');
      }
    } catch (err) {
      console.error('Error fetching pre-register list:', err);
      setPreRegisterError('Error de red al consultar los pre-registros');
    } finally {
      setPreRegisterLoading(false);
    }
  }, [preRegisterPage, preRegisterSearch, preRegisterLimit]);

  useEffect(() => {
    fetchPreRegisterData(1, '', 10);
  }, [fetchPreRegisterData]);

  useEffect(() => {
    if (activeView === 'preregistro') {
      const delayDebounceFn = setTimeout(() => {
        fetchPreRegisterData(preRegisterPage, preRegisterSearch, preRegisterLimit);
      }, 300);

      const interval = setInterval(() => {
        fetchPreRegisterData(preRegisterPage, preRegisterSearch, preRegisterLimit);
      }, 4000);

      return () => {
        clearTimeout(delayDebounceFn);
        clearInterval(interval);
      };
    }
  }, [activeView, preRegisterPage, preRegisterSearch, preRegisterLimit, fetchPreRegisterData]);

  function exportPreRegisterCSV() {
    if (preRegisterList.length === 0) {
      alert('No hay pre-registros para exportar.');
      return;
    }
    const headers = ['ID', 'Nombre Completo', 'Correo Electronico', 'Telefono', 'Fecha de Registro'];
    const rows = preRegisterList.map(item => [
      item.id,
      `"${(item.nombre_completo || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.telefono || '').replace(/"/g, '""')}"`,
      `"${new Date(item.created_at).toLocaleString('es-CO')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `preregistros_boho_sunday_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleConvertPreRegisterToSale(item: any) {
    setForm({
      ...form,
      name: item.nombre_completo || '',
      email: item.email || '',
      confirmEmail: item.email || '',
      phone: (item.telefono || '').replace(/^\+\d+\s*/, ''),
    });
    setActiveView('venta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
      <style dangerouslySetInnerHTML={{ __html: customAdminCSS }} />

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

            <button
              type="button"
              data-view="preregistro"
              aria-current={activeView === 'preregistro' ? 'page' : undefined}
              onClick={() => setActiveView('preregistro')}
            >
              <svg className="ic" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
              Pre-registros <span className="count">{preRegisterTotal > 0 ? preRegisterTotal : ''}</span>
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

          {/* ---------- 5. PRE-REGISTROS VIEW ---------- */}
          <div className={`view ${activeView === 'preregistro' ? 'is-active' : ''}`} id="v-preregistro">
            <header className="topbar" style={{ margin: '-24px -28px 24px' }}>
              <div>
                <h2>Pre-registros</h2>
                <div className="sub">{preRegisterTotal} personas interesadas registradas en la web · actualización en vivo</div>
              </div>
              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={exportPreRegisterCSV}>Exportar CSV</button>
              </div>
            </header>

            <div className="card">
              <div className="filters">
                <div className="search">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                  <input
                    placeholder="Buscar por nombre, correo o teléfono..."
                    value={preRegisterSearch}
                    onChange={(e) => {
                      setPreRegisterSearch(e.target.value);
                      setPreRegisterPage(1);
                    }}
                  />
                </div>

                {/* Limit Selector */}
                <select
                  style={{ marginLeft: 'auto' }}
                  value={preRegisterLimit}
                  onChange={(e) => {
                    setPreRegisterLimit(Number(e.target.value));
                    setPreRegisterPage(1);
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '8px 12px' }}
                  onClick={() => fetchPreRegisterData(preRegisterPage, preRegisterSearch, preRegisterLimit)}
                  title="Actualizar lista"
                >
                  {preRegisterLoading ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>

              {preRegisterError && (
                <div style={{ padding: '12px 20px', color: 'var(--sold)', fontSize: '13px' }}>
                  {preRegisterError}
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Interesado</th>
                      <th>Correo Electrónico</th>
                      <th>Teléfono</th>
                      <th>Fecha de Registro</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preRegisterLoading && preRegisterList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                          Cargando lista de pre-registros...
                        </td>
                      </tr>
                    ) : preRegisterList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                          No se encontraron personas interesadas registradas.
                        </td>
                      </tr>
                    ) : (
                      preRegisterList.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="who">
                              <b>{item.nombre_completo}</b>
                              <span className="ord">ID #{item.id}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--ink-2)' }}>{item.email}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--ink-2)' }}>{item.telefono}</span>
                          </td>
                          <td>
                            <span className="num" style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                              {new Date(item.created_at).toLocaleString('es-CO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td>
                            <span className="pill pill-bronze">Interesado</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="rowact"
                                title="Pre-llenar datos en Registrar Venta"
                                onClick={() => handleConvertPreRegisterToSale(item)}
                              >
                                Registrar Venta
                              </button>
                              <a
                                href={`https://wa.me/${(item.telefono || '').replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${item.nombre_completo}! Gracias por tu interés en Boho Sunday.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rowact"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                title="Enviar mensaje por WhatsApp"
                              >
                                WhatsApp
                              </a>
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
                  {preRegisterTotal > 0
                    ? `${(preRegisterPage - 1) * preRegisterLimit + 1} a ${Math.min(preRegisterPage * preRegisterLimit, preRegisterTotal)} de ${preRegisterTotal} interesadas`
                    : '0 pre-registros'}
                </span>
                {preRegisterTotalPages > 1 && (
                  <div className="pager">
                    <button
                      type="button"
                      disabled={preRegisterPage <= 1}
                      onClick={() => setPreRegisterPage(p => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: preRegisterTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === preRegisterTotalPages || Math.abs(p - preRegisterPage) <= 1)
                      .map(p => (
                        <button
                          key={p}
                          type="button"
                          aria-current={p === preRegisterPage ? 'true' : undefined}
                          onClick={() => setPreRegisterPage(p)}
                        >
                          {p}
                        </button>
                      ))}

                    <button
                      type="button"
                      disabled={preRegisterPage >= preRegisterTotalPages}
                      onClick={() => setPreRegisterPage(p => Math.min(preRegisterTotalPages, p + 1))}
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
