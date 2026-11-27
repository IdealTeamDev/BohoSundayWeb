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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795711160/photo_10_n5kl5b.webp',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795711162/photo_11_g0bkyf.webp',
    iconCard: '/images/icon/icon-oasis.png',
  },
  primitivo: {
    key: 'primitivo',
    name: 'CAMA LUJO PRIMITIVO',
    description: 'Las camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres)',
    persons: 10,
    licor: '1 Botella licor premium',
    agua: 4,
    redbull: 4,
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795716443/photo_13_gf7h8k.png',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795711163/photo_7_phpfcj.webp',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795716445/photo_12_ycuuru.png',
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
    img: 'https://res.cloudinary.com/dow0dxajr/image/upload/v1795711159/photo_9_zggqcb.webp',
    iconCard: '/images/icon/icon-backstage.png',
  },
};
