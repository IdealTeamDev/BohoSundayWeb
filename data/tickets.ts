import { Ticket } from '@/types';

export const tickets: Ticket[] = [

  // ── MESA OASIS · 12 mesas · 6 arriba y 6 abajo de la pasarela ─────────
  // Arriba (1-6) — 2 filas de 3
  { id:'oasis-1',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:1,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:8,  y:36.4} },
  { id:'oasis-2',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:2,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:36.4} },
  { id:'oasis-3',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:3,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:20, y:36.4} },
  { id:'oasis-4',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:4,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:false, position:{x:8,  y:41.7} },
  { id:'oasis-5',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:5,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:41.7} },
  { id:'oasis-6',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:6,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:20, y:41.7} },

  // Abajo (7-12) — 2 filas de 3
  { id:'oasis-7',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:7,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:7.9,  y:57.5} },
  { id:'oasis-8',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:8,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:12.8, y:57.5} },
  { id:'oasis-9',  zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:9,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:false, position:{x:17.7, y:57.5} },
  { id:'oasis-10', zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:10, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:7.9,  y:62.6} },
  { id:'oasis-11', zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:11, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:12.8, y:62.6} },
  { id:'oasis-12', zone:'oasis', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:12, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:17.7, y:62.6} },

  // ── CAMA BOHEMIAN · 9 mesas · fila superior ───────────────────────────
  { id:'bohemian-1', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:1, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:25, y:28} },
  { id:'bohemian-2', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:2, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:31, y:28} },
  { id:'bohemian-3', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:3, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:false, position:{x:36.3, y:28} },
  { id:'bohemian-4', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:4, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:41.2, y:28} },
  { id:'bohemian-5', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:5, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:46.1, y:28} },
  { id:'bohemian-6', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:6, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:51.1, y:28} },
  { id:'bohemian-7', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:7, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:false, position:{x:56.0, y:28} },
  { id:'bohemian-8', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:8, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:60.9, y:28} },
  { id:'bohemian-9', zone:'bohemian', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:9, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:65.9, y:28} },

  // ── CAMA PRIMITIVO · fila inferior + derecha ──────────────────────────
  { id:'primitivo-9',  zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:9,  persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:26.4, y:69.8} },
  { id:'primitivo-10', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:10, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:32.3, y:69.8} },
  { id:'primitivo-11', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:11, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:false, position:{x:37.2, y:69.8} },
  { id:'primitivo-12', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:12, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:42.1, y:69.8} },
  { id:'primitivo-13', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:13, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:47.0, y:69.8} },
  { id:'primitivo-19', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:19, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:52.0, y:69.8} },
  { id:'primitivo-20', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:20, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:false, position:{x:56.9, y:69.8} },
  { id:'primitivo-21', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:21, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:61.8, y:69.8} },
  { id:'primitivo-22', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:22, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:66.7, y:69.8} },
  // Derecha de la piscina
  { id:'primitivo-14', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:14, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:74.4, y:40.0} },
  { id:'primitivo-15', zone:'primitivo', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:15, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:74.4, y:45.3} },

  // ── CAMA VIP · 4 mesas · abajo dispersas ─────────────────────────────
  { id:'vip-1', zone:'vip', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:1, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:8.5,  y:83.8} },
  { id:'vip-2', zone:'vip', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:2, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:17.0, y:86.2} },
  { id:'vip-3', zone:'vip', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:3, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:false, position:{x:66.3, y:83.8} },
  { id:'vip-4', zone:'vip', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:4, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:77.1, y:82.4} },

  // ── MESA CANDELA · 2 mesas ────────────────────────────────────────────
  { id:'candela-1', zone:'candela', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:1, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:true,  position:{x:30.0, y:81.4} },
  { id:'candela-2', zone:'candela', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:2, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:false, position:{x:44.8, y:81.4} },

  // ── BACKSTAGE · zona única ────────────────────────────────────────────
  { id:'backstage-1', zone:'backstage', img:'images/ticketsImage/BACKSTAGE.png', name:'BACKSTAGE', number:1, persons:20, price:18000000, currency:'COP', includes:{licor:'3 Botellas licor premium', agua:10, redBull:10}, available:true, position:{x:82.5, y:49.1} },
];