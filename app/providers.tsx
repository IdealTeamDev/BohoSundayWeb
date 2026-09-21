'use client';

import React from 'react';
import { TicketsProvider } from '@/lib/TicketsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TicketsProvider>
      {children}
    </TicketsProvider>
  );
}
