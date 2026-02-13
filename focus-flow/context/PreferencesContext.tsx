import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdvancedSettings,
  WorkScheduleConfig,
  NotificationScheduleConfig,
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
  // Extra exercises
  toggleExtraExercise: (id: number) => void;
  enableExtraExercisesByZone: (ids: number[]) => void;
  disableExtraExercisesByZone: (ids: number[]) => void;
  isExtraExerciseEnabled: (id: number) => boolean;
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
        const parsed = JSON.parse(stored);
        // Migration: convert old customExercises to new format if needed
        if (parsed.customExercises && !parsed.enabledExtraExercises) {
          parsed.enabledExtraExercises = [];
          delete parsed.customExercises;
        }
        return { ...DEFAULT_ADVANCED_SETTINGS, ...parsed };
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

  // Extra exercises functions
  const toggleExtraExercise = (id: number) => {
    setAdvancedSettings((prev) => {
      const current = prev.enabledExtraExercises || [];
      const isEnabled = current.includes(id);
      return {
        ...prev,
        enabledExtraExercises: isEnabled
          ? current.filter((exId) => exId !== id)
          : [...current, id],
      };
    });
  };

  const enableExtraExercisesByZone = (ids: number[]) => {
    setAdvancedSettings((prev) => {
      const current = prev.enabledExtraExercises || [];
      const newIds = ids.filter((id) => !current.includes(id));
      return {
        ...prev,
        enabledExtraExercises: [...current, ...newIds],
      };
    });
  };

  const disableExtraExercisesByZone = (ids: number[]) => {
    setAdvancedSettings((prev) => {
      const current = prev.enabledExtraExercises || [];
      return {
        ...prev,
        enabledExtraExercises: current.filter((id) => !ids.includes(id)),
      };
    });
  };

  const isExtraExerciseEnabled = (id: number): boolean => {
    return (advancedSettings.enabledExtraExercises || []).includes(id);
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
        toggleExtraExercise,
        enableExtraExercisesByZone,
        disableExtraExercisesByZone,
        isExtraExerciseEnabled,
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
