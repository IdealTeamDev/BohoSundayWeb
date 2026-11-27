import { NextRequest, NextResponse } from 'next/server';
import { processAbandonedCarts } from '@/lib/abandonedCart';
import { sendAbandonedCartEmail } from '@/lib/emailService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get('testEmail');
    const testLang = (searchParams.get('lang') || 'es').toLowerCase();

    if (testEmail) {
      await sendAbandonedCartEmail({
        email: testEmail,
        locale: testLang === 'en' ? 'en' : 'es',
      });

      return NextResponse.json({
        success: true,
        message: `Correo de prueba de carrito abandonado enviado a ${testEmail}`,
        recipient: testEmail,
        language: testLang,
        sentAt: new Date().toISOString(),
      });
    }

    const result = await processAbandonedCarts(true);

    return NextResponse.json({
      success: true,
      message: 'Barrido de carritos abandonados ejecutado correctamente.',
      ...result,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AbandonedCart Cron] 🚨 Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando barrido de carritos abandonados.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
