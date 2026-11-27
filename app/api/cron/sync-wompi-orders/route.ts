import { NextRequest, NextResponse } from 'next/server';
import {
  syncAllPendingOrders,
  verifyOrderWithWompi,
} from '@/lib/wompiReconciliation';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const wompiTxId = searchParams.get('wompiTxId') || searchParams.get('txId') || undefined;
    const hoursBack = Math.max(1, parseInt(searchParams.get('hours') || '24', 10));

    if (orderId) {
      const result = await verifyOrderWithWompi(orderId, {
        wompiTxId,
        autoRejectOnDecline: true,
      });
      return NextResponse.json({
        success: true,
        result,
        checkedAt: new Date().toISOString(),
      });
    }

    const summary = await syncAllPendingOrders({
      hoursBack,
      force: true,
    });

    return NextResponse.json({
      success: true,
      message: `Sincronización Wompi completada: ${summary.approvedCount} orden(es) aprobada(s) de ${summary.checkedCount} pendiente(s) revisada(s).`,
      ...summary,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron Sync Wompi Orders] 🚨 Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando sincronización de órdenes pendientes con Wompi.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
