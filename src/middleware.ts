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

  // Para rutas protegidas, verificamos la autenticación con un enfoque simple
  if (isProtectedRoute) {
    // Verificación mediante cookie simulada
    const hasCookie = req.cookies.has('simulatedAuth');
    
    if (!hasCookie) {
      // Redirigir a la página de inicio si no hay autenticación
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