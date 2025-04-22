import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  type NotificationMessage,
  type ScheduleOptions,
  scheduleReminder,
  sendEmailNotification,
  NotificationError
} from '@/lib/notificationLogic';

/**
 * Extended notification type with read status and ID
 */
interface Notification extends NotificationMessage {
  id: string;
  read: boolean;
  createdAt: string;
  scheduledFor?: string;
}

/**
 * Return type for the useNotifications hook
 */
interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  scheduleNotification: (msg: NotificationMessage, opts: ScheduleOptions) => Promise<void>;
  sendImmediate: (msg: NotificationMessage) => Promise<void>;
  markAsRead: (notificationId: string) => void;
}

/**
 * Hook for managing user notifications
 * @returns Object containing notification state and operations
 * @throws {Error} If used outside of AuthProvider
 */
export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  if (!user) throw new Error('useNotifications requires an authenticated user');

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Fetches user's notifications from the API
   */
  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications?userId=${user.uid}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch notifications: ${res.statusText}`);
      }
      const data = await res.json();
      setNotifications(data.notifications);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Schedules a notification for future delivery
   */
  const scheduleNotification = React.useCallback(async (
    msg: NotificationMessage,
    opts: ScheduleOptions
  ) => {
    if (!user) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      await scheduleReminder(user.uid, msg.subject, opts);
      await fetchNotifications();
    } catch (err) {
      const message = err instanceof NotificationError ? err.message : 'Failed to schedule notification';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchNotifications]);

  /**
   * Sends an immediate notification
   */
  const sendImmediate = React.useCallback(async (msg: NotificationMessage) => {
    if (!user) throw new Error('Not authenticated');
    setIsLoading(true);
    setError(null);
    try {
      await sendEmailNotification(user.uid, msg);
    } catch (err) {
      const message = err instanceof NotificationError ? err.message : 'Failed to send notification';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Marks a notification as read
   */
  const markAsRead = React.useCallback(async (notificationId: string) => {
    try {
      // Update local state immediately
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );

      // Persist to backend
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
    } catch (err) {
      // Revert local state on error
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(message);
    }
  }, [user]);

  // Fetch notifications on mount and when user changes
  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.uid, fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    scheduleNotification,
    sendImmediate,
    markAsRead
  };
} 