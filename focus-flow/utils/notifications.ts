// Browser Notifications utility

import { isWithinNotificationHours } from './sessions';

export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
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

export const showNotification = (
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Notification | null => {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const { onClick, ...notificationOptions } = options || {};
    const notification = new Notification(title, {
      icon: '/exercises/exercise_1.png',
      badge: '/exercises/exercise_1.png',
      ...notificationOptions,
    });

    // Add click handler to focus the app
    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };

    return notification;
  } catch (error) {
    console.warn('Could not show notification:', error);
    return null;
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
