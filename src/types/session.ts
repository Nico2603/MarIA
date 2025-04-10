export type SessionType = 'free' | 'paid' | 'subscription';

export type PlanType = 'free' | 'individual' | 'monthly';

export interface SessionLimit {
  planType: PlanType;
  totalSessions: number;
  remainingSessions: number;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  type: SessionType;
  completed: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  startDate: Date;
  endDate: Date;
  active: boolean;
  paymentId: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  planType: PlanType;
  sessionId?: string;
  subscriptionId?: string;
  paymentMethod: string;
  paymentReference: string;
}

export interface UserSessionStatus {
  hasFreeSession: boolean;
  currentPlan: PlanType;
  remainingSessions: number;
  subscription?: {
    active: boolean;
    endDate: Date;
  };
} 