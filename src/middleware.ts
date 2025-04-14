import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Por ahora, el middleware no realiza ninguna acción.
// Se puede reactivar en el futuro si es necesario.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

// Opcional: eliminar el matcher si no se aplica a ninguna ruta específica
// export const config = {
//   matcher: [],
// }; 