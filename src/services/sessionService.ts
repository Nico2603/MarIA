import { UserSessionStatus, Payment, PlanType } from '@/types/session';

// Función helper para guardar datos de sesión en localStorage
function saveSessionData(data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sessionData', JSON.stringify(data));
  }
}

// Función helper para obtener datos de sesión del localStorage
function getSessionData(): any {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('sessionData');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// Inicializa datos simulados si no existen
function initializeSessionDataIfNeeded() {
  const data = getSessionData();
  if (!data) {
    const initialData = {
      sessionStatus: {
        hasFreeSession: true,
        currentPlan: 'free',
        remainingSessions: 1,
        subscription: undefined
      },
      payments: []
    };
    saveSessionData(initialData);
    return initialData;
  }
  return data;
}

// Obtener el estado de la sesión del usuario
export async function getUserSessionStatus(): Promise<UserSessionStatus> {
  try {
    // Inicializar datos si es necesario
    const data = initializeSessionDataIfNeeded();
    return data.sessionStatus;
  } catch (error) {
    console.error('Error en getUserSessionStatus:', error);
    // Devolver un estado predeterminado si hay error
    return {
      hasFreeSession: true,
      currentPlan: 'free',
      remainingSessions: 1,
      subscription: undefined
    };
  }
}

// Consumir una sesión
export async function useSession(): Promise<{ success: boolean; status: UserSessionStatus }> {
  try {
    const data = initializeSessionDataIfNeeded();
    const status = data.sessionStatus;
    
    // Verificar si hay sesiones disponibles
    if (status.remainingSessions <= 0) {
      return {
        success: false,
        status
      };
    }
    
    // Actualizar sesiones restantes
    status.remainingSessions -= 1;
    data.sessionStatus = status;
    saveSessionData(data);
    
    return {
      success: true,
      status
    };
  } catch (error) {
    console.error('Error en useSession:', error);
    throw error;
  }
}

// Actualizar el plan del usuario
export async function updateUserPlan(
  plan: PlanType, 
  sessions: number, 
  subscriptionDetails?: { endDate: Date }
): Promise<{ success: boolean; status: UserSessionStatus }> {
  try {
    const data = initializeSessionDataIfNeeded();
    
    // Actualizar plan
    data.sessionStatus = {
      ...data.sessionStatus,
      currentPlan: plan,
      remainingSessions: sessions,
      subscription: subscriptionDetails
    };
    
    saveSessionData(data);
    
    return {
      success: true,
      status: data.sessionStatus
    };
  } catch (error) {
    console.error('Error en updateUserPlan:', error);
    throw error;
  }
}

// Procesar un pago
export async function processPayment(
  planType: PlanType,
  paymentMethod: string,
  sessionId?: string
): Promise<{ success: boolean; payment: Payment }> {
  try {
    const data = initializeSessionDataIfNeeded();
    
    // Simular creación de pago
    const payment: Payment = {
      id: Date.now().toString(),
      userId: 'user-simulado',
      amount: planType === 'monthly' ? 29.99 : 9.99,
      currency: 'USD',
      status: 'completed',
      date: new Date(),
      planType,
      paymentMethod,
      sessionId: sessionId,
      paymentReference: `REF-${Date.now()}`
    };
    
    // Agregar pago al historial
    if (!data.payments) {
      data.payments = [];
    }
    data.payments.push(payment);
    
    // Actualizar plan según tipo de pago
    if (planType === 'monthly') {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      data.sessionStatus = {
        ...data.sessionStatus,
        currentPlan: 'monthly',
        remainingSessions: 30, // Sesiones ilimitadas para el mes
        subscription: {
          active: true,
          endDate: expiryDate
        }
      };
    } else {
      // Sesión individual
      data.sessionStatus = {
        ...data.sessionStatus,
        remainingSessions: data.sessionStatus.remainingSessions + 1
      };
    }
    
    saveSessionData(data);
    
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Error en processPayment:', error);
    throw error;
  }
}

// Obtener historial de pagos
export async function getPaymentHistory(): Promise<Payment[]> {
  try {
    const data = initializeSessionDataIfNeeded();
    return data.payments || [];
  } catch (error) {
    console.error('Error en getPaymentHistory:', error);
    return [];
  }
} 