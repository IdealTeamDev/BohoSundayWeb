import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';

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

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('pre_register')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`nombre_completo.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[Admin Pre-Register API] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });

  } catch (error: any) {
    console.error('[Admin Pre-Register API] Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    let rawItems: Array<{ nombre_completo?: string; email?: string }> = [];

    if (body.mode === 'single') {
      if (!body.nombre_completo || !body.email) {
        return NextResponse.json({ error: 'El nombre y correo son obligatorios' }, { status: 400 });
      }
      rawItems = [{ nombre_completo: body.nombre_completo, email: body.email }];
    } else if (body.mode === 'bulk' && Array.isArray(body.items)) {
      rawItems = body.items;
    } else {
      return NextResponse.json({ error: 'Formato de datos no válido' }, { status: 400 });
    }

    // 1. Limpieza y validación inicial en memoria
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validItemsMap = new Map<string, { nombre_completo: string; email: string }>();
    let invalidCount = 0;

    for (const item of rawItems) {
      const nombre = (item.nombre_completo || '').trim();
      const email = (item.email || '').trim().toLowerCase();

      if (!nombre || !email || !emailRegex.test(email)) {
        invalidCount++;
        continue;
      }

      // Evitar duplicados internos dentro del mismo payload
      if (!validItemsMap.has(email)) {
        validItemsMap.set(email, { nombre_completo: nombre, email: item.email!.trim() });
      }
    }

    const itemsToProcess = Array.from(validItemsMap.values());
    if (itemsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron registros válidos para procesar.', invalidSkipped: invalidCount },
        { status: 400 }
      );
    }

    // 2. Deduplicación ultrarrápida contra la base de datos Supabase
    const allEmails = itemsToProcess.map((i) => i.email.toLowerCase());
    const existingEmailsSet = new Set<string>();

    // Consultar por lotes de 500 correos para no exceder límites de URL en Supabase
    const CHUNK_SIZE = 500;
    for (let i = 0; i < allEmails.length; i += CHUNK_SIZE) {
      const chunk = allEmails.slice(i, i + CHUNK_SIZE);
      const { data: existingData, error: checkError } = await supabase
        .from('pre_register')
        .select('email')
        .in('email', chunk);

      if (checkError) {
        console.error('[Admin Pre-Register POST] Error verificando duplicados:', checkError);
      } else if (existingData) {
        existingData.forEach((row) => existingEmailsSet.add(row.email.toLowerCase()));
      }
    }

    // 3. Filtrar registros verdaderamente nuevos
    const newRecords = itemsToProcess.filter(
      (item) => !existingEmailsSet.has(item.email.toLowerCase())
    );

    const duplicatesSkipped = itemsToProcess.length - newRecords.length;

    if (newRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Todos los correos ingresados ya se encontraban registrados.',
        added: 0,
        duplicatesSkipped,
        invalidSkipped: invalidCount,
      });
    }

    // 4. Inserción masiva optimizada en lotes
    const insertPayload = newRecords.map((item) => ({
      nombre_completo: item.nombre_completo,
      email: item.email,
      telefono: '', // Admin no exige teléfono
    }));

    let totalInserted = 0;
    for (let i = 0; i < insertPayload.length; i += CHUNK_SIZE) {
      const batch = insertPayload.slice(i, i + CHUNK_SIZE);
      const { error: insertError } = await supabase.from('pre_register').insert(batch);

      if (insertError) {
        console.error('[Admin Pre-Register POST] Error insertando lote:', insertError);
        return NextResponse.json(
          { error: `Error guardando en base de datos: ${insertError.message}` },
          { status: 500 }
        );
      }
      totalInserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Se registraron exitosamente ${totalInserted} personas.${
        duplicatesSkipped > 0 ? ` ${duplicatesSkipped} correo(s) ya existían y fueron ignorados.` : ''
      }`,
      added: totalInserted,
      duplicatesSkipped,
      invalidSkipped: invalidCount,
    });
  } catch (error: any) {
    console.error('[Admin Pre-Register POST] Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

