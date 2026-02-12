import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdvancedSettings,
  WorkScheduleConfig,
  NotificationScheduleConfig,
  CustomExercise,
  DEFAULT_ADVANCED_SETTINGS,
} from '../types';

interface Preferences {
  postures: {
    sitting: boolean;
    standing: boolean;
  };
  notifications: boolean;
  sound: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  setPosture: (posture: 'sitting' | 'standing', enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  // Advanced settings
  advancedSettings: AdvancedSettings;
  setAdvancedEnabled: (enabled: boolean) => void;
  setWorkSchedule: (config: WorkScheduleConfig) => void;
  setNotificationSchedule: (config: NotificationScheduleConfig) => void;
  addCustomExercise: (exercise: CustomExercise) => void;
  updateCustomExercise: (id: string, exercise: Partial<CustomExercise>) => void;
  deleteCustomExercise: (id: string) => void;
}

const defaultPreferences: Preferences = {
  postures: {
    sitting: true,
    standing: true,
  },
  notifications: false,
  sound: true,
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const STORAGE_KEY = 'focus-flow-preferences';
const ADVANCED_SETTINGS_KEY = 'focus-flow-advanced-settings';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(() => {
    const stored = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_ADVANCED_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_ADVANCED_SETTINGS;
      }
    }
    return DEFAULT_ADVANCED_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(ADVANCED_SETTINGS_KEY, JSON.stringify(advancedSettings));
  }, [advancedSettings]);

  const setPosture = (posture: 'sitting' | 'standing', enabled: boolean) => {
    setPreferences((prev) => {
      const newPostures = { ...prev.postures, [posture]: enabled };
      // Asegurar que al menos una postura esté seleccionada
      if (!newPostures.sitting && !newPostures.standing) {
        return prev;
      }
      return { ...prev, postures: newPostures };
    });
  };

  const setNotifications = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, notifications: enabled }));
  };

  const setSound = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, sound: enabled }));
  };

  // Advanced settings functions
  const setAdvancedEnabled = (enabled: boolean) => {
    setAdvancedSettings((prev) => ({ ...prev, enabled }));
  };

  const setWorkSchedule = (config: WorkScheduleConfig) => {
    setAdvancedSettings((prev) => ({ ...prev, workSchedule: config }));
  };

  const setNotificationSchedule = (config: NotificationScheduleConfig) => {
    setAdvancedSettings((prev) => ({ ...prev, notificationSchedule: config }));
  };

  const addCustomExercise = (exercise: CustomExercise) => {
    setAdvancedSettings((prev) => ({
      ...prev,
      customExercises: [...prev.customExercises, exercise],
    }));
  };

  const updateCustomExercise = (id: string, updates: Partial<CustomExercise>) => {
    setAdvancedSettings((prev) => ({
      ...prev,
      customExercises: prev.customExercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex
      ),
    }));
  };

  const deleteCustomExercise = (id: string) => {
    setAdvancedSettings((prev) => ({
      ...prev,
      customExercises: prev.customExercises.filter((ex) => ex.id !== id),
    }));
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setPosture,
        setNotifications,
        setSound,
        advancedSettings,
        setAdvancedEnabled,
        setWorkSchedule,
        setNotificationSchedule,
        addCustomExercise,
        updateCustomExercise,
        deleteCustomExercise,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
