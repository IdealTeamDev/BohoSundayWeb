import crypto from 'crypto';
import { supabase } from './supabase';

export interface StaffUser {
  id: string;
  username: string;
  pin_hash: string;
  role: 'admin' | 'bouncer' | 'viewer1' | 'viewer2';
  name: string;
  is_active: boolean;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function authenticateUser(username: string, password: string): Promise<{ user: StaffUser, token: string } | null> {
  const { data, error } = await supabase.from('staff_users').select('*').eq('username', username).eq('is_active', true).single();
  if (error || !data) return null;
  
  if (data.pin_hash === hashPassword(password)) {
    const token = Buffer.from(username + ':' + data.pin_hash).toString('base64');
    return { user: data, token };
  }
  
  return null;
}

export async function validateSession(token: string | null): Promise<StaffUser | null> {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, hash] = decoded.split(':');
    if (!username || !hash) return null;
    
    const { data, error } = await supabase.from('staff_users').select('*').eq('username', username).eq('is_active', true).single();
    if (data && data.pin_hash === hash) {
      return data;
    }
  } catch(e) {}
  
  return null;
}
