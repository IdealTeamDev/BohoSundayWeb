import { NextRequest, NextResponse } from 'next/server';
import { validateSession, hashPassword } from '@/lib/authStore';
import { supabase } from '@/lib/supabase';

// Helper for authorization
async function authCheck(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  const user = await validateSession(token);
  // Only admins can manage staff
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await authCheck(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { data, error } = await supabase.from('staff_users').select('id, name, username, role, is_active').order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authCheck(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { name, username, pin, role } = body;

    if (!name || !username || !pin || !role) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const { data, error } = await supabase.from('staff_users').insert([{
      name,
      username,
      pin_hash: hashPassword(pin),
      role,
      is_active: true
    }]).select('id, name, username, role, is_active').single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await authCheck(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    const { error } = await supabase.from('staff_users').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminUser = await authCheck(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json();
    const { id, pin } = body;

    if (!id || !pin) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const { error } = await supabase.from('staff_users').update({
      pin_hash: hashPassword(pin)
    }).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
