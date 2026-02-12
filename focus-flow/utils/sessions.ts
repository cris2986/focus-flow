// Session scheduling utilities
// Supports both default (6 sessions 10:00-17:00) and custom schedules

import { WorkScheduleConfig, DEFAULT_WORK_SCHEDULE } from '../types';

export interface Session {
  id: number;
  hour: number;
  minute: number;
  label: string;
}

// Storage key for advanced settings
const ADVANCED_SETTINGS_KEY = 'focus-flow-advanced-settings';

// Generate sessions based on schedule configuration
export const generateSessions = (config: WorkScheduleConfig): Session[] => {
  const startMinutes = config.startHour * 60 + config.startMinute;
  const endMinutes = config.endHour * 60 + config.endMinute;
  const totalMinutes = endMinutes - startMinutes;

  // Calculate interval between sessions
  // For N sessions, we have N-1 intervals
  const intervalMinutes = totalMinutes / (config.sessionCount - 1);

  const sessions: Session[] = [];

  for (let i = 0; i < config.sessionCount; i++) {
    const sessionMinutes = startMinutes + Math.round(intervalMinutes * i);
    const hour = Math.floor(sessionMinutes / 60);
    const minute = Math.round(sessionMinutes % 60);

    sessions.push({
      id: i + 1,
      hour,
      minute,
      label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    });
  }

  return sessions;
};

// Default sessions (backward compatible)
export const DEFAULT_SESSIONS: Session[] = generateSessions(DEFAULT_WORK_SCHEDULE);

// Get current work schedule from localStorage
export const getWorkScheduleConfig = (): WorkScheduleConfig | null => {
  try {
    const stored = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (!stored) return null;

    const settings = JSON.parse(stored);
    if (settings.enabled && settings.workSchedule) {
      return settings.workSchedule;
    }
  } catch {
    // Invalid data
  }
  return null;
};

// Get the current scheduled sessions (dynamic or default)
export const getScheduledSessions = (): Session[] => {
  const customConfig = getWorkScheduleConfig();
  if (customConfig) {
    return generateSessions(customConfig);
  }
  return DEFAULT_SESSIONS;
};

// For backward compatibility - this now returns the dynamic sessions
export const SCHEDULED_SESSIONS = DEFAULT_SESSIONS;

// Helper to get sessions (use this in components for reactivity)
export const useScheduledSessions = (): Session[] => {
  return getScheduledSessions();
};

export const getSessionTimeInMinutes = (session: Session): number => {
  return session.hour * 60 + session.minute;
};

export const getCurrentTimeInMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getNextSession = (): Session | null => {
  const sessions = getScheduledSessions();
  const currentMinutes = getCurrentTimeInMinutes();

  // Find the next session
  for (const session of sessions) {
    const sessionMinutes = getSessionTimeInMinutes(session);
    if (sessionMinutes > currentMinutes) {
      return session;
    }
  }

  // If no more sessions today, return first session (for tomorrow)
  return sessions[0] || null;
};

export const isSessionTime = (toleranceMinutes: number = 5): boolean => {
  const sessions = getScheduledSessions();
  const currentMinutes = getCurrentTimeInMinutes();

  for (const session of sessions) {
    const sessionMinutes = getSessionTimeInMinutes(session);
    const diff = Math.abs(currentMinutes - sessionMinutes);
    if (diff <= toleranceMinutes) {
      return true;
    }
  }

  return false;
};

export const getTimeUntilNextSession = (): { hours: number; minutes: number } | null => {
  const nextSession = getNextSession();
  if (!nextSession) return null;

  const currentMinutes = getCurrentTimeInMinutes();
  const sessionMinutes = getSessionTimeInMinutes(nextSession);

  let diffMinutes = sessionMinutes - currentMinutes;

  // If negative, it means the session is tomorrow
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours
  }

  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60,
  };
};

export const formatTimeUntil = (time: { hours: number; minutes: number }): string => {
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}min`;
  }
  return `${time.minutes} min`;
};

export const isWithinWorkHours = (): boolean => {
  const config = getWorkScheduleConfig() || DEFAULT_WORK_SCHEDULE;
  const currentMinutes = getCurrentTimeInMinutes();
  const startMinutes = config.startHour * 60 + config.startMinute;
  const endMinutes = config.endHour * 60 + config.endMinute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Check if current time is within notification hours (for quiet hours)
export const isWithinNotificationHours = (): boolean => {
  try {
    const stored = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (!stored) return true; // If no settings, always allow

    const settings = JSON.parse(stored);
    if (!settings.enabled || !settings.notificationSchedule?.enabled) {
      return true; // If not enabled, always allow
    }

    const config = settings.notificationSchedule;
    const currentMinutes = getCurrentTimeInMinutes();
    const startMinutes = config.startHour * 60 + config.startMinute;
    const endMinutes = config.endHour * 60 + config.endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } catch {
    return true;
  }
};

export const getTodayCompletedSessions = (): number[] => {
  const stored = localStorage.getItem('focus-flow-completed-sessions');
  if (!stored) return [];

  try {
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date === today) {
      return data.sessions || [];
    }
  } catch {
    // Invalid data
  }
  return [];
};

export const markSessionCompleted = (sessionId: number): void => {
  const today = new Date().toDateString();
  const completed = getTodayCompletedSessions();

  if (!completed.includes(sessionId)) {
    completed.push(sessionId);
  }

  localStorage.setItem('focus-flow-completed-sessions', JSON.stringify({
    date: today,
    sessions: completed,
  }));
};

export const getCurrentSessionId = (): number | null => {
  const sessions = getScheduledSessions();
  const currentMinutes = getCurrentTimeInMinutes();

  for (const session of sessions) {
    const sessionMinutes = getSessionTimeInMinutes(session);
    const diff = Math.abs(currentMinutes - sessionMinutes);
    if (diff <= 30) { // Within 30 minutes of session time
      return session.id;
    }
  }

  return null;
};

// Check if the current active session (if any) has been completed
export const isCurrentSessionCompleted = (): boolean => {
  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return false;

  const completedSessions = getTodayCompletedSessions();
  return completedSessions.includes(currentSessionId);
};

// Get total sessions count (for dynamic display)
export const getTotalSessionsCount = (): number => {
  return getScheduledSessions().length;
};

// Format schedule for display
export const formatScheduleRange = (): string => {
  const sessions = getScheduledSessions();
  if (sessions.length === 0) return '';

  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  return `${first.label} - ${last.label}`;
};
