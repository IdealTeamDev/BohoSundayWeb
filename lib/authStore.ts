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

// In-memory token cache (in production this could be Redis or JWT, but memory is fine for a few admins)
// key: token, value: userId
const activeSessions = new Map<string, string>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function readStaffFromFile(): StaffUser[] {
  try {
    if (!fs.existsSync(STAFF_FILE)) {
      const dir = path.dirname(STAFF_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Create a default admin user (username: admin, password: password)
      const defaultUsers: StaffUser[] = [
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
      fs.writeFileSync(STAFF_FILE, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
    const content = fs.readFileSync(STAFF_FILE, 'utf8');
    return JSON.parse(content) as StaffUser[];
  } catch (error) {
    console.error('[AuthStore] Error reading staff file:', error);
    return [];
  }
}

export function authenticateUser(username: string, password: string): { user: StaffUser, token: string } | null {
  const users = readStaffFromFile();
  const user = users.find(u => u.username === username);
  
  if (!user) return null;
  
  if (user.passwordHash === hashPassword(password)) {
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, user.id);
    return { user, token };
  }
  
  return null;
}

export function validateSession(token: string | null): StaffUser | null {
  if (!token) return null;
  const userId = activeSessions.get(token);
  if (!userId) return null;
  
  const users = readStaffFromFile();
  const user = users.find(u => u.id === userId);
  return user || null;
}

export function logout(token: string) {
  activeSessions.delete(token);
}
