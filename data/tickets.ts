import { Ticket } from '@/types';

export const tickets: Ticket[] = [

  // ── MESA OASIS · 12 mesas · 6 arriba y 6 abajo de la pasarela ─────────
  // Arriba (1-6) — 2 filas de 3
  { id:'oasis-1',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:1,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:8,  y:36.4} },
  { id:'oasis-2',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:2,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:36.4} },
  { id:'oasis-3',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:3,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:20, y:36.4} },
  { id:'oasis-4',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:4,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true, position:{x:8,  y:41.7} },
  { id:'oasis-5',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:5,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:41.7} },
  { id:'oasis-6',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:6,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:20, y:41.7} },

  // Abajo (7-12) — 2 filas de 3
  { id:'oasis-7',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:7,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:8,  y:57} },
  { id:'oasis-8',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:8,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:57} },
  { id:'oasis-9',  zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:9,  persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true, position:{x:20, y:57} },
  { id:'oasis-10', zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:10, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:8,  y:62.6} },
  { id:'oasis-11', zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:11, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:14, y:62.6} },
  { id:'oasis-12', zone:'oasis', iconCard:'images/icon/icon-oasis.png', img:'images/ticketsImage/OASIS.png', name:'MESA OASIS', number:12, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:20, y:62.6} },

  // ── CAMA BOHEMIAN · 8 mesas · fila superior ───────────────────────────
  { id:'bohemian-1', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:1, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:27, y:28} },
  { id:'bohemian-2', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:2, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:33, y:28} },
  { id:'bohemian-3', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:3, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true, position:{x:39, y:28} },
  { id:'bohemian-4', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:4, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:45, y:28} },
  { id:'bohemian-5', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:5, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:51, y:28} },
  { id:'bohemian-6', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:6, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:29.5, y:34} },
  { id:'bohemian-7', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:7, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true, position:{x:36, y:34} },
  { id:'bohemian-8', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:8, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:4, redBull:4}, available:true,  position:{x:43, y:34} },
  

  // ── CAMA BOHEMIAN ·7 mesas · fila inferior ───────────────────────────
  { id:'bohemian-9', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:9, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:29.4, y:62} },
  { id:'bohemian-10', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:10, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:36, y:62} },
  { id:'bohemian-11', zone:'bohemian', iconCard:'images/icon/icon-bohemian.png', img:'images/ticketsImage/BOHEMIAN.png', name:'CAMA BOHEMIAN', number:11, persons:8, price:4800000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:4}, available:true,  position:{x:43, y:62} },
  // ── CAMA PRIMITIVO · fila superior  derecha ──────────────────────────
  { id:'primitivo-12', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:12,  persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:57.5, y:28} },
  { id:'primitivo-13', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:13, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:64, y:28} },
  { id:'primitivo-14', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:14, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true, position:{x:70, y:28} },
  { id:'primitivo-15', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:15, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:49.5, y:34} },
  { id:'primitivo-16', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:16, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:55.5, y:34} },
  { id:'primitivo-17', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:17, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:62, y:34} },
  { id:'primitivo-18', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:18, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true, position:{x:68.5, y:34} },

  // --- CAMA PRIMITIVO 4 mesas fila inferior derecha
  { id:'primitivo-19', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:19, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:49.5, y:62} },
  { id:'primitivo-20', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:20, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:56.5, y:62} },
  { id:'primitivo-21', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:21, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:63.2, y:62} },
  { id:'primitivo-22', zone:'primitivo', iconCard:'images/icon/icon-primitivo.png', img:'images/ticketsImage/PRIMITIVO.png', name:'CAMA PRIMITIVO', number:22, persons:10, price:7500000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:5, redBull:5}, available:true,  position:{x:70, y:62} },

  
  // ── CAMA VIP · 4 mesas · abajo dispersas ─────────────────────────────
  { id:'vip-1', zone:'vip', iconCard:'images/icon/icons-tickets.png', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:1, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:35.6,  y:70.2} },
  { id:'vip-2', zone:'vip', iconCard:'images/icon/icons-tickets.png', img:'images/ticketsImage/CAMA VIP.png', name:'CAMA VIP', number:2, persons:6, price:5200000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:3, redBull:3}, available:true,  position:{x:55, y:70.2} },
  

  // ── MESA CANDELA · 2 mesas ────────────────────────────────────────────
  { id:'candela-1', zone:'candela', iconCard:'images/icon/icon-mesacandela.png', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:1, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:true,  position:{x:84, y:70} },
  { id:'candela-2', zone:'candela', iconCard:'images/icon/icon-mesacandela.png', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:2, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:true, position:{x:73, y:71} },
  { id:'candela-3', zone:'candela', iconCard:'images/icon/icon-mesacandela.png', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:3, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:true, position:{x:24, y:71} },
  { id:'candela-4', zone:'candela', iconCard:'images/icon/icon-mesacandela.png', img:'images/ticketsImage/CANDELA.png', name:'MESA CANDELA', number:4, persons:6, price:2650000, currency:'COP', includes:{licor:'1 Botella licor premium', agua:1, redBull:3}, available:true, position:{x:14, y:70} },

  // ── BACKSTAGE · zona única ────────────────────────────────────────────
  { id:'backstage-1', zone:'backstage', iconCard:'images/icon/icon-backstage.png', img:'images/ticketsImage/BACKSTAGE.png', name:'BACKSTAGE', number:1, persons:20, price:18000000, currency:'COP', includes:{licor:'3 Botellas licor premium', agua:10, redBull:10}, available:true, position:{x:90, y:49.1} },
];