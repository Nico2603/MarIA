'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSessionStatus, PlanType, Payment } from '@/types/session';
import { 
  getUserSessionStatus, 
  useSession as useSessionService, 
  processPayment, 
  updateUserPlan, 
  getPaymentHistory 
} from '@/services/sessionService';

interface SessionContextProps {
  sessionStatus: UserSessionStatus | null;
  loading: boolean;
  payments: Payment[];
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  consumeSession: () => Promise<boolean>;
  buySession: (paymentMethod: string) => Promise<boolean>;
  buySubscription: (paymentMethod: string) => Promise<boolean>;
  refreshSessionStatus: () => Promise<void>;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionStatus, setSessionStatus] = useState<UserSessionStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de autenticación simulado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay usuario en localStorage
        const storedUser = localStorage.getItem('simulatedUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Cargar datos de sesión
          await refreshSessionStatus();
          await loadPaymentHistory();
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login simulado
  const login = () => {
    setIsLoading(true);
    
    // Simular un retraso de red
    setTimeout(() => {
      const simulatedUser = {
        name: 'Usuario Simulado',
        email: 'usuario@ejemplo.com',
        given_name: 'Usuario',
        picture: ''
      };
      
      localStorage.setItem('simulatedUser', JSON.stringify(simulatedUser));
      setUser(simulatedUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Inicializar datos de sesión
      refreshSessionStatus();
      loadPaymentHistory();
    }, 800);
  };
  
  // Logout simulado
  const logout = () => {
    setIsLoading(true);
    
    // Simular un retraso de red
    setTimeout(() => {
      localStorage.removeItem('simulatedUser');
      setUser(null);
      setIsAuthenticated(false);
      setSessionStatus(null);
      setPayments([]);
      setIsLoading(false);
    }, 500);
  };

  // Cargar el historial de pagos
  const loadPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory();
      setPayments(history);
    } catch (error) {
      console.error('Error al cargar historial de pagos:', error);
    }
  };

  // Actualizar estado de sesión
  const refreshSessionStatus = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const status = await getUserSessionStatus();
      setSessionStatus(status);
    } catch (error) {
      console.error('Error al obtener estado de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  // Consumir una sesión
  const consumeSession = async (): Promise<boolean> => {
    if (!isAuthenticated || !sessionStatus) return false;
    
    try {
      const result = await useSessionService();
      if (result.success) {
        setSessionStatus(result.status);
      }
      return result.success;
    } catch (error) {
      console.error('Error al consumir sesión:', error);
      return false;
    }
  };

  // Comprar una sesión individual
  const buySession = async (paymentMethod: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const result = await processPayment('individual', paymentMethod);
      if (result.success) {
        await refreshSessionStatus();
        await loadPaymentHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al comprar sesión:', error);
      return false;
    }
  };

  // Comprar una suscripción mensual
  const buySubscription = async (paymentMethod: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const result = await processPayment('monthly', paymentMethod);
      if (result.success) {
        await refreshSessionStatus();
        await loadPaymentHistory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al comprar suscripción:', error);
      return false;
    }
  };

  const value = {
    sessionStatus,
    loading,
    payments,
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    consumeSession,
    buySession,
    buySubscription,
    refreshSessionStatus
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext debe ser usado dentro de un SessionProvider');
  }
  return context;
} 