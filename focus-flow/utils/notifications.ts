// Notifications utility - supports both browser and native (Capacitor)

import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { isWithinNotificationHours } from './sessions';

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

export const isNotificationSupported = (): boolean => {
  if (isNative) return true;
  return 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (isNative) {
    // On native, we'll check permissions differently
    return 'default'; // Will be checked via Capacitor
  }
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isNative) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.warn('Could not request native notification permissions:', error);
      return false;
    }
  }

  // Browser fallback
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Register action types for native notifications
const registerNotificationActions = async () => {
  if (!isNative) return;

  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'SESSION_REMINDER',
          actions: [
            {
              id: 'start',
              title: 'Iniciar',
            },
            {
              id: 'skip',
              title: 'Omitir',
              destructive: true,
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.warn('Could not register notification actions:', error);
  }
};

// Initialize notifications (call this on app start)
export const initializeNotifications = async (): Promise<void> => {
  if (!isNative) return;

  try {
    // Register action types
    await registerNotificationActions();

    // Listen for notification actions
    await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      if (notification.actionId === 'start') {
        // User tapped "Iniciar" - focus the app
        window.focus();
      }
      // 'skip' action just dismisses
    });
  } catch (error) {
    console.warn('Could not initialize native notifications:', error);
  }
};

export const showNotification = async (
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Promise<void> => {
  if (isNative) {
    try {
      const scheduleOptions: ScheduleOptions = {
        notifications: [
          {
            id: Date.now(),
            title,
            body: options?.body || '',
            schedule: { at: new Date(Date.now() + 100) }, // Immediate
            sound: 'notification.wav',
            actionTypeId: 'SESSION_REMINDER',
            extra: null,
          },
        ],
      };
      await LocalNotifications.schedule(scheduleOptions);
    } catch (error) {
      console.warn('Could not show native notification:', error);
    }
    return;
  }

  // Browser fallback
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    const { onClick, ...notificationOptions } = options || {};
    const notification = new Notification(title, {
      icon: '/exercises/exercise_1.png',
      badge: '/exercises/exercise_1.png',
      ...notificationOptions,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };
  } catch (error) {
    console.warn('Could not show notification:', error);
  }
};

export const showSessionReminder = (onAction?: () => void): void => {
  // Check if we're within notification hours (respects quiet hours settings)
  if (!isWithinNotificationHours()) {
    return;
  }

  showNotification('¡Hora de tu pausa activa!', {
    body: 'Toca para iniciar tu ejercicio y mantener tu cuerpo activo.',
    tag: 'session-reminder',
    requireInteraction: true,
    onClick: onAction,
  });
};

// Schedule notifications for upcoming sessions (native only)
export const scheduleSessionNotifications = async (
  sessions: { id: number; time: Date; label: string }[]
): Promise<void> => {
  if (!isNative) return;

  try {
    // Cancel all pending notifications first
    await LocalNotifications.cancel({ notifications: sessions.map((s) => ({ id: s.id })) });

    // Schedule new notifications
    const now = new Date();
    const futureNotifications = sessions
      .filter((s) => s.time > now)
      .map((s) => ({
        id: s.id,
        title: '¡Hora de tu pausa activa!',
        body: `Sesión de las ${s.label} - Mantén tu cuerpo activo`,
        schedule: { at: s.time },
        sound: 'notification.wav',
        actionTypeId: 'SESSION_REMINDER',
        extra: { sessionId: s.id },
      }));

    if (futureNotifications.length > 0) {
      await LocalNotifications.schedule({ notifications: futureNotifications });
    }
  } catch (error) {
    console.warn('Could not schedule notifications:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async (): Promise<void> => {
  if (!isNative) return;

  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch (error) {
    console.warn('Could not cancel notifications:', error);
  }
};
