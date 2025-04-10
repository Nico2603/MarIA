import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserSessionStatus, PlanType } from '@/types/session';

// Simulación de base de datos en memoria para desarrollo
const userSessionsDB = new Map<string, UserSessionStatus>();

// Función para obtener ID del usuario desde la cookie (simulación)
function getUserIdFromCookies() {
  // En producción, se decodificaría el token JWT de Auth0
  // Para la demo, usamos un ID fijo o generado
  return 'user_' + Math.random().toString(36).substring(2, 9);
}

// GET - Obtener estado de sesión del usuario
export async function GET(request: Request) {
  try {
    // Obtener ID de usuario (en producción se usaría Auth0)
    const userId = getUserIdFromCookies();
    
    // Si no hay datos para este usuario, crear un perfil predeterminado (nueva cuenta)
    if (!userSessionsDB.has(userId)) {
      const defaultStatus: UserSessionStatus = {
        hasFreeSession: true,
        currentPlan: 'free',
        remainingSessions: 1,
        subscription: undefined
      };
      userSessionsDB.set(userId, defaultStatus);
    }
    
    return NextResponse.json(userSessionsDB.get(userId));
  } catch (error) {
    console.error('Error al obtener estado de sesión:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de sesión' },
      { status: 500 }
    );
  }
}

// POST - Actualizar estado de sesión del usuario
export async function POST(request: Request) {
  try {
    // Obtener ID de usuario (en producción se usaría Auth0)
    const userId = getUserIdFromCookies();
    const body = await request.json();
    const { action } = body;
    
    let userStatus = userSessionsDB.get(userId) || {
      hasFreeSession: true,
      currentPlan: 'free' as PlanType,
      remainingSessions: 1,
      subscription: undefined
    };
    
    // Gestionar diferentes acciones
    switch (action) {
      case 'useSession':
        // Consumir una sesión
        if (userStatus.remainingSessions > 0) {
          userStatus.remainingSessions -= 1;
          
          // Si era la sesión gratuita, marcarla como usada
          if (userStatus.currentPlan === 'free' && userStatus.hasFreeSession) {
            userStatus.hasFreeSession = false;
          }
          
          userSessionsDB.set(userId, userStatus);
          return NextResponse.json({ success: true, status: userStatus });
        } else {
          return NextResponse.json(
            { error: 'No tienes sesiones disponibles' },
            { status: 400 }
          );
        }
      
      case 'updatePlan':
        const { plan, sessions, subscriptionDetails } = body;
        userStatus.currentPlan = plan;
        userStatus.remainingSessions = sessions;
        
        if (subscriptionDetails) {
          userStatus.subscription = {
            active: true,
            endDate: new Date(subscriptionDetails.endDate)
          };
        } else {
          userStatus.subscription = undefined;
        }
        
        userSessionsDB.set(userId, userStatus);
        return NextResponse.json({ success: true, status: userStatus });
      
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado de sesión' },
      { status: 500 }
    );
  }
} 