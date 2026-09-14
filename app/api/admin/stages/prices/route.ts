import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stageId, prices } = body;

    if (!stageId || !prices || typeof prices !== 'object') {
      return NextResponse.json({ error: 'stageId y prices (objeto) son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('event_stages')
      .update({ prices })
      .eq('id', stageId)
      .select();

    if (error) {
      console.error('[Admin Stage Prices API] Error updating prices:', error);
      return NextResponse.json({ error: 'Error al actualizar precios en la base de datos' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stageId,
      prices,
      message: 'Precios pre-configurados guardados con éxito',
    });
  } catch (error: any) {
    console.error('[Admin Stage Prices API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
