import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Evitar procesar archivos estáticos, imágenes, fuentes, favicon, y rutas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar si la URL empieza con /en o /en/
  const isEnglish = pathname.startsWith('/en/') || pathname === '/en';

  if (isEnglish) {
    return NextResponse.next();
  }

  // Si no empieza con /en, asumimos español (es) por defecto.
  // Reescribimos internamente la ruta agregando /es al inicio
  const newUrl = new URL(`/es${pathname}`, request.url);
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: [
    // Ejecutar en todas las páginas excepto archivos estáticos, etc.
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
