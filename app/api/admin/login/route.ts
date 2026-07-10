import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/authStore';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const authResult = authenticateUser(username, password);

    if (!authResult) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: authResult.token,
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        role: authResult.user.role
      }
    });

  } catch (error) {
    console.error('[Admin Login API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
