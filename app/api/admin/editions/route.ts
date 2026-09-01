import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/authStore';
import { 
  getAllEditions, 
  getActiveEdition, 
  setActiveEdition, 
  createEdition, 
  resetInventoryForEdition 
} from '@/lib/editions';

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

    const editions = await getAllEditions();
    const activeEdition = await getActiveEdition();

    return NextResponse.json({
      success: true,
      editions,
      activeEdition,
    });
  } catch (error: any) {
    console.error('[Admin Editions API] GET Error:', error);
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
    const { action, name, slug } = body;

    if (action === 'create') {
      if (!name) {
        return NextResponse.json({ error: 'Nombre de la edición es requerido' }, { status: 400 });
      }
      const newEdition = await createEdition(name, slug);
      if (!newEdition) {
        return NextResponse.json({ error: 'No se pudo crear la edición' }, { status: 500 });
      }
      return NextResponse.json({ success: true, edition: newEdition });
    }

    if (action === 'set_active') {
      if (!slug) {
        return NextResponse.json({ error: 'Slug de la edición es requerido' }, { status: 400 });
      }
      const success = await setActiveEdition(slug);
      if (!success) {
        return NextResponse.json({ error: 'No se pudo activar la edición' }, { status: 500 });
      }
      const activeEdition = await getActiveEdition();
      return NextResponse.json({ success: true, activeEdition });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Editions API] POST Error:', error);
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

    const result = await resetInventoryForEdition();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Admin Editions API] PUT Reset Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
