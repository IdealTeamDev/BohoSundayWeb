import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Registro de Venta Manual - Boho Sunday Staff',
  description: 'Herramienta interna para registro de ventas manuales de Boho Sunday.',
  robots: {
    index: false,
    follow: false,
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function QuickSellLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
