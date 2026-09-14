import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stageId, updatedPrices } = body;

    if (!stageId) {
      return NextResponse.json({ error: 'stageId es requerido' }, { status: 400 });
    }

    // 1. If updatedPrices provided, update prices object for this stage
    if (updatedPrices && typeof updatedPrices === 'object') {
      const { error: updatePricesErr } = await supabase
        .from('event_stages')
        .update({ prices: updatedPrices })
        .eq('id', stageId);

      if (updatePricesErr) {
        console.error('[Admin Stage Activate] Error updating stage prices:', updatePricesErr);
        return NextResponse.json({ error: 'Error al actualizar precios de la etapa' }, { status: 500 });
      }
    }

    // 2. Fetch all stages
    const { data: allStages, error: fetchErr } = await supabase
      .from('event_stages')
      .select('id');

    if (fetchErr || !allStages) {
      console.error('[Admin Stage Activate] Error fetching stages:', fetchErr);
      return NextResponse.json({ error: 'Error al consultar etapas' }, { status: 500 });
    }

    // 3. Activate target stage (start_date in past, end_date in future)
    // Deactivate all other stages (start_date in far future)
    const activeStartDate = '2026-01-01T00:00:00.000Z';
    const activeEndDate = '2099-12-31T23:59:59.000Z';
    const inactiveDate = '2099-01-01T00:00:00.000Z';

    for (const stage of allStages) {
      if (stage.id === stageId) {
        await supabase
          .from('event_stages')
          .update({
            start_date: activeStartDate,
            end_date: activeEndDate,
          })
          .eq('id', stage.id);
      } else {
        await supabase
          .from('event_stages')
          .update({
            start_date: inactiveDate,
            end_date: inactiveDate,
          })
          .eq('id', stage.id);
      }
    }

    return NextResponse.json({
      success: true,
      activeStageId: stageId,
      message: 'Etapa activada correctamente',
    });
  } catch (error: any) {
    console.error('[Admin Stage Activate API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
