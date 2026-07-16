import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';
import { getActiveStage } from '@/lib/tickets';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all event stages from database
    const { data: stages, error } = await supabase
      .from('event_stages')
      .select('id, name, start_date, end_date, prices')
      .order('start_date', { ascending: true });

    if (error) {
      throw error;
    }

    // 2. Resolve active stage
    const activeStage = await getActiveStage();

    return NextResponse.json({
      success: true,
      stages: stages || [],
      activeStageId: activeStage?.id || null,
    });
  } catch (error: any) {
    console.error('[Admin Stages API] Error fetching event stages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
