import { NextResponse } from 'next/server';
import { Payment, PlanType } from '@/types/session';

// Simulación de base de datos en memoria para desarrollo
const paymentsDB = new Map<string, Payment[]>();

// Función para obtener ID del usuario desde la cookie (simulación)
function getUserIdFromCookies() {
  // En producción, se decodificaría el token JWT de Auth0
  // Para la demo, usamos un ID fijo o generado
  return 'user_' + Math.random().toString(36).substring(2, 9);
}

// GET - Obtener historial de pagos del usuario
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromCookies();
    
    // Si no hay datos para este usuario, devolver arreglo vacío
    if (!paymentsDB.has(userId)) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(paymentsDB.get(userId));
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de pagos' },
      { status: 500 }
    );
  }
}

// POST - Procesar un nuevo pago
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromCookies();
    const body = await request.json();
    const { planType, paymentMethod, sessionId } = body;
    
    // Simular procesamiento de pago con pasarela externa
    const processingTime = 1000; // 1 segundo para simular
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Generar ID de pago único
    const paymentId = 'pay_' + Date.now().toString();
    
    // Determinar monto según el plan
    let amount = 0;
    switch (planType) {
      case 'individual':
        amount = 40000; // 40.000 COP
        break;
      case 'monthly':
        amount = 120000; // 120.000 COP
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de plan no válido' },
          { status: 400 }
        );
    }
    
    // Crear registro de pago
    const newPayment: Payment = {
      id: paymentId,
      userId,
      amount,
      currency: 'COP',
      status: 'completed', // En producción, esto dependería de la respuesta de la pasarela
      date: new Date(),
      planType: planType as PlanType,
      sessionId: sessionId || undefined,
      paymentMethod,
      paymentReference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
    
    // Guardar pago en la base de datos
    if (!paymentsDB.has(userId)) {
      paymentsDB.set(userId, []);
    }
    paymentsDB.get(userId)?.push(newPayment);
    
    // Si el pago es exitoso, actualizar la sesión del usuario mediante la API de sesiones
    // (En producción, esto se haría con una transacción o de manera atómica)
    let sessions = planType === 'individual' ? 1 : 4;
    
    // Simular llamada a API de sesiones para actualizar plan
    const updateSessionBody = {
      action: 'updatePlan',
      plan: planType,
      sessions,
      subscriptionDetails: planType === 'monthly' ? {
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      } : undefined
    };
    
    // En producción, aquí se haría la llamada real
    // await fetch('/api/sessions', {
    //   method: 'POST',
    //   body: JSON.stringify(updateSessionBody)
    // });
    
    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Pago procesado correctamente'
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
} 