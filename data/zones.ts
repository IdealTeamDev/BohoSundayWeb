export interface ZoneCategoryConfig {
  key: string;
  name: string;
  description: string;
  persons: number;
  chairs?: number;
  chairsLabel?: string;
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1790015211/photo_3_avwexi.webp',
    iconCard: '/images/icon/icon-bohemian.png',
  },
  oasis: {
    key: 'oasis',
    name: 'MESA OASIS',
    description: 'Mesas cocteleras',
    persons: 6,
    chairs: 4,
    chairsLabel: 'Sillas altas',
    licor: '1 Botella licor premium',
    agua: 3,
    redbull: 3,
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1790015210/photo_4_dv3lz4.webp',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1790016492/photo_9_1_qn0u9v.webp',
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
    chairs: 4,
    chairsLabel: 'Sillas altas',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1790015214/photo_2_wjhjxx.webp',
    iconCard: '/images/icon/icon-backstage.png',
  },
};
