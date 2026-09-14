export interface ZoneCategoryConfig {
  key: string;
  name: string;
  description: string;
  persons: number;
  licor: string;
  agua: number;
  redbull: number;
  img: string;
  iconCard: string;
}

export const ZONE_DEFAULTS: Record<string, ZoneCategoryConfig> = {
  bohemian: {
    key: 'bohemian',
    name: 'CAMA BOHEMIAN',
    description: 'Las camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres)',
    persons: 8,
    licor: '1 Botella licor premium',
    agua: 4,
    redbull: 4,
    img: '/images/ticketsimage/BOHEMIAN.png',
    iconCard: '/images/icon/icon-bohemian.png',
  },
  oasis: {
    key: 'oasis',
    name: 'MESA OASIS',
    description: 'Mesas cocteleras',
    persons: 6,
    licor: '1 Botella licor premium',
    agua: 3,
    redbull: 3,
    img: '/images/ticketsimage/OASIS.png',
    iconCard: '/images/icon/icon-oasis.png',
  },
  primitivo: {
    key: 'primitivo',
    name: 'CAMA LUJO PRIMITIVO',
    description: 'Las camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres)',
    persons: 10,
    licor: '1 Botella licor premium',
    agua: 5,
    redbull: 5,
    img: '/images/ticketsimage/PRIMITIVO.png',
    iconCard: '/images/icon/icon-primitivo.png',
  },
  vip: {
    key: 'vip',
    name: 'CAMA VIP',
    description: 'Las camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres)',
    persons: 10,
    licor: '1 Botella licor premium',
    agua: 5,
    redbull: 5,
    img: '/images/ticketsimage/VIP.png',
    iconCard: '/images/icon/icon-vip.png',
  },
  candela: {
    key: 'candela',
    name: 'MESA CANDELA',
    description: 'Mesa alta exclusiva',
    persons: 6,
    licor: '1 Botella licor premium',
    agua: 3,
    redbull: 3,
    img: '/images/ticketsimage/CANDELA.png',
    iconCard: '/images/icon/icon-mesacandela.png',
  },
  backstage: {
    key: 'backstage',
    name: 'BACKSTAGE',
    description: 'Ubicación preferencial cerca al escenario',
    persons: 20,
    licor: '3 Botellas de licor premium',
    agua: 10,
    redbull: 10,
    img: '/images/ticketsimage/BACKSTAGE.png',
    iconCard: '/images/icon/icon-backstage.png',
  },
};
