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

  // Verificar si la URL ya cuenta con un prefijo de locale válido (/en o /es)
  const hasLocale = 
    pathname.startsWith('/en/') || 
    pathname === '/en' || 
    pathname.startsWith('/es/') || 
    pathname === '/es';

  if (hasLocale) {
    return NextResponse.next();
  }

  // Si no empieza con locale, asumimos español (es) por defecto.
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
