import { createContext, useContext, type ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Removed unused Notification interface

interface NotificationContextType {
  notify: (type: NotificationType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notify = (
    type: NotificationType,
    message: string,
    _duration = 3000
  ) => {
    toast({
      variant: type === 'error' ? 'destructive' : 'default',
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
    });
  };

  const success = (message: string, duration?: number) =>
    notify('success', message, duration);
  const error = (message: string, duration?: number) =>
    notify('error', message, duration);
  const warning = (message: string, duration?: number) =>
    notify('warning', message, duration);
  const info = (message: string, duration?: number) =>
    notify('info', message, duration);

  const value: NotificationContextType = {
    notify,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
}

