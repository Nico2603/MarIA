export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationMessage {
  message: string;
  type: NotificationType;
  duration: number;
} 