import { Ticket } from '@/types';

export const tickets: Ticket[] = [
  // ── BOLETAS INDIVIDUALES (Se mantienen estáticas temporalmente) ──────────
  {
    id: 'early',
    zone: 'general',
    iconCard: 'images/icon/icon-early.png',
    img: 'images/individual-ticket/card-early.png',
    name: 'EARLY',
    number: 1,
    persons: 1,
    price: 290000,
    currency: 'COP',
    includes: { licor: 'Antes de las 2PM', agua: 0, redBull: 0 },
    available: true,
    position: { x: 0, y: 0 },
    stock: 100
  },
  {
    id: 'anytime',
    zone: 'general',
    iconCard: 'images/icon/icon-anytime.png',
    img: 'images/individual-ticket/card-anytime.png',
    name: 'ANYTIME',
    number: 2,
    persons: 1,
    price: 340000,
    currency: 'COP',
    includes: { licor: 'Ingresa en cualquier horario', agua: 0, redBull: 0 },
    available: true,
    position: { x: 0, y: 0 },
    stock: 100
  }
];