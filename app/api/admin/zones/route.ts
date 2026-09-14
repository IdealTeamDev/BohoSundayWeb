import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';
import { ZONE_DEFAULTS, ZoneCategoryConfig } from '@/data/zones';

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

    // Query distinct zone rows from boleteria_mesas
    const { data: rows, error } = await supabase
      .from('boleteria_mesas')
      .select('zone, licor, agua, redbull, persons, description, img, iconCard');

    if (error) {
      console.warn('[Admin Zones API] Error fetching boleteria_mesas, using defaults:', error);
    }

    const zonesMap: Record<string, ZoneCategoryConfig> = { ...ZONE_DEFAULTS };

    if (rows && rows.length > 0) {
      rows.forEach((r: any) => {
        if (!r.zone) return;
        const zKey = r.zone.toLowerCase().trim();
        const baseConfig = zonesMap[zKey] || {
          key: zKey,
          name: `ZONA ${zKey.toUpperCase()}`,
          description: r.description || '',
          persons: Number(r.persons) || 1,
          licor: r.licor || '',
          agua: Number(r.agua) || 0,
          redbull: Number(r.redbull) || 0,
          img: r.img || '',
          iconCard: r.iconCard || '',
        };

        // Override with DB values if present
        zonesMap[zKey] = {
          ...baseConfig,
          licor: r.licor !== null && r.licor !== undefined ? r.licor : baseConfig.licor,
          agua: r.agua !== null && r.agua !== undefined ? Number(r.agua) : baseConfig.agua,
          redbull: r.redbull !== null && r.redbull !== undefined ? Number(r.redbull) : baseConfig.redbull,
          persons: r.persons !== null && r.persons !== undefined ? Number(r.persons) : baseConfig.persons,
          description: r.description !== null && r.description !== undefined ? r.description : baseConfig.description,
        };
      });
    }

    return NextResponse.json({
      success: true,
      zones: Object.values(zonesMap),
    });
  } catch (error: any) {
    console.error('[Admin Zones API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { zone, licor, agua, redbull, persons, description } = body;

    if (!zone) {
      return NextResponse.json({ error: 'Missing zone identifier' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (licor !== undefined) updatePayload.licor = licor;
    if (agua !== undefined) updatePayload.agua = Number(agua);
    if (redbull !== undefined) updatePayload.redbull = Number(redbull);
    if (persons !== undefined) updatePayload.persons = Number(persons);
    if (description !== undefined) updatePayload.description = description;

    const { error } = await supabase
      .from('boleteria_mesas')
      .update(updatePayload)
      .eq('zone', zone.toLowerCase().trim());

    if (error) {
      console.error('[Admin Zones API] PUT Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Atributos de la zona '${zone}' actualizados correctamente en todas las mesas.`,
    });
  } catch (error: any) {
    console.error('[Admin Zones API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
