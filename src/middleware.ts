import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Esta función puede ser marcada como `async` si se usa `await` dentro de ella
export async function middleware(req: NextRequest) {
  // Obtiene la ruta actual
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/chat', '/perfil'];
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Si la URL tiene parámetros de auth0 callback, limpia la URL
  if (url.search.includes('code=') && url.search.includes('state=')) {
    // Crear una respuesta con la misma ruta pero sin query params
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Para rutas protegidas, verificamos la autenticación con un enfoque simple
  if (isProtectedRoute) {
    // Verificación básica mediante cookie de sesión
    const authCookie = req.cookies.get('appSession');
    
    if (!authCookie) {
      // Redirigir a la página de inicio si no hay cookie de sesión
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Si todo está correcto, continúa con la solicitud
  return NextResponse.next();
}

// Configuración para solo aplicar este middleware a ciertas rutas
export const config = {
  matcher: [
    '/chat',
    '/chat/:path*',
    '/perfil',
    '/perfil/:path*',
    // Excluye API y recursos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 