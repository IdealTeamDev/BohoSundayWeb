export type LockStatus = 'available' | 'locked' | 'sold';

export interface TicketLock {
  ticketId: string;
  sessionToken: string;
  expiresAt: number; // timestamp ms
  status: LockStatus;
}

export interface CheckoutSession {
  ticketId: string;
  sessionToken: string;
  buyerInfo?: BuyerInfo;
  createdAt: number;
}

export interface BuyerInfo {
  name: string;
  phone: string;
  email: string;
}