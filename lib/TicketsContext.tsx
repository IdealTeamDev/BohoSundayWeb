'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types';

export type TicketStatus = 'available' | 'locked' | 'sold';

export interface TicketStatusInfo {
  status: TicketStatus;
  remaining?: number;
}

interface TicketsContextType {
  tickets: Ticket[];
  ticketStatuses: Record<string, TicketStatusInfo>;
  loading: boolean;
  refreshTickets: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextType>({
  tickets: [],
  ticketStatuses: {},
  loading: true,
  refreshTickets: async () => {},
});

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, TicketStatusInfo>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTicketsAndStatuses = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets?nocache=${Date.now()}`);
      if (res.ok) {
        const data: Ticket[] = await res.json();
        setTickets(data);

        const mapping: Record<string, TicketStatusInfo> = {};
        data.forEach((item: any) => {
          mapping[item.id] = {
            status: item.status || 'available',
            remaining: item.remaining ?? item.stock,
          };
        });
        setTicketStatuses(mapping);
      }
    } catch (error) {
      console.error('[TicketsContext] Error fetching tickets and statuses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Precarga inicial en segundo plano al montar la aplicación
    fetchTicketsAndStatuses();

    // 2. Suscripción Realtime a TODAS las tablas de la BD involucradas
    const channel = supabase
      .channel('global_tickets_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'boleteria_mesas' },
        () => {
          fetchTicketsAndStatuses();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'boleteria_individual' },
        () => {
          fetchTicketsAndStatuses();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_locks' },
        () => {
          fetchTicketsAndStatuses();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchased_tickets' },
        () => {
          fetchTicketsAndStatuses();
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTicketsAndStatuses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchTicketsAndStatuses]);

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        ticketStatuses,
        loading,
        refreshTickets: fetchTicketsAndStatuses,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketsContext);
}
