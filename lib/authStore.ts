import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STAFF_FILE = path.join(process.cwd(), 'data', 'staff.json');

export interface StaffUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'bouncer' | 'viewer1' | 'viewer2';
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEFAULT_USERS: StaffUser[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: hashPassword('password'),
    role: 'admin'
  },
  {
    id: '2',
    username: 'portero1',
    passwordHash: hashPassword('portero'),
    role: 'bouncer'
  }
];

function readStaffFromFile(): StaffUser[] {
  try {
    if (!fs.existsSync(STAFF_FILE)) {
      return DEFAULT_USERS;
    }
    const content = fs.readFileSync(STAFF_FILE, 'utf8');
    return JSON.parse(content) as StaffUser[];
  } catch (error) {
    console.error('[AuthStore] Error reading staff file, falling back to defaults:', error);
    return DEFAULT_USERS;
  }
}

export function authenticateUser(username: string, password: string): { user: StaffUser, token: string } | null {
  const users = readStaffFromFile();
  const user = users.find(u => u.username === username);
  
  if (!user) return null;
  
  if (user.passwordHash === hashPassword(password)) {
    // Stateless token for Vercel Serverless (Base64 of username:hash)
    const token = Buffer.from(`${user.username}:${user.passwordHash}`).toString('base64');
    return { user, token };
  }
  
  return null;
}

export function validateSession(token: string | null): StaffUser | null {
  if (!token) return null;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, hash] = decoded.split(':');
    
    if (!username || !hash) return null;
    
    const users = readStaffFromFile();
    const user = users.find(u => u.username === username);
    
    if (user && user.passwordHash === hash) {
      return user;
    }
  } catch (e) {
    return null;
  }
  
  return null;
}

export function logout(token: string) {
  // Stateless tokens can't be invalidated easily without a DB. 
  // Client clears it locally.
}
