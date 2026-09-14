import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/authStore';
import { getLockStatus, recordFailedAttempt, resetAttempts } from '@/lib/loginRateLimit';
import { sendSecurityAlertEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'IP desconocida';
    const lockKey = `${username.trim().toLowerCase()}`;

    // 1. Check if user/IP is currently locked out
    const lockStatus = getLockStatus(lockKey);
    if (lockStatus.isLocked) {
      const minutes = Math.ceil(lockStatus.remainingSeconds / 60);
      return NextResponse.json(
        {
          error: `Acceso bloqueado por seguridad debido a múltiples intentos fallidos (más de 4). Intenta nuevamente en ${minutes} minuto(s).`,
          locked: true,
          remainingSeconds: lockStatus.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Authenticate credentials
    const authResult = await authenticateUser(username, password);

    if (!authResult) {
      // 3. Record failed attempt and check if newly locked out
      const attemptResult = recordFailedAttempt(lockKey);

      if (attemptResult.newlyLocked || attemptResult.attempts >= 4) {
        // Send alert email asynchronously
        sendSecurityAlertEmail({
          username,
          ip: clientIp,
          attemptsCount: attemptResult.attempts,
        }).catch((err) => console.error('[Login API] Failed to trigger security alert email:', err));

        return NextResponse.json(
          {
            error: 'Has excedido el límite de 4 intentos de inicio de sesión fallidos. El acceso se ha bloqueado por 5 minutos y se envió una alerta por correo.',
            locked: true,
            attempts: attemptResult.attempts,
          },
          { status: 429 }
        );
      }

      const attemptsLeft = 4 - attemptResult.attempts;
      return NextResponse.json(
        {
          error: `Usuario o contraseña incorrectos. Quedan ${attemptsLeft} intento(s) antes del bloqueo de seguridad.`,
          attemptsLeft,
        },
        { status: 401 }
      );
    }

    // 4. Reset failed attempts on successful login
    resetAttempts(lockKey);

    return NextResponse.json({
      success: true,
      token: authResult.token,
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        role: authResult.user.role,
      },
    });

  } catch (error) {
    console.error('[Admin Login API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

