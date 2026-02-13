import { Zone } from '../types';

export interface CompletedExercise {
  id: number;
  name: string;
  zone: Zone;
  durationSeconds: number;
  completedAt: string; // ISO date string
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  sessions: CompletedExercise[];
}

const STATS_KEY = 'focus-flow-stats';

// Get all stats from localStorage
export const getAllStats = (): DailyStats[] => {
  const stored = localStorage.getItem(STATS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// Save stats to localStorage
const saveStats = (stats: DailyStats[]): void => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

// Get today's date string in YYYY-MM-DD format
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Record a completed exercise
export const recordCompletedExercise = (exercise: {
  id: number;
  name: string;
  zone: Zone;
  durationSeconds: number;
}): void => {
  const stats = getAllStats();
  const today = getTodayString();

  const completedExercise: CompletedExercise = {
    ...exercise,
    completedAt: new Date().toISOString(),
  };

  const todayIndex = stats.findIndex(s => s.date === today);
  if (todayIndex >= 0) {
    stats[todayIndex].sessions.push(completedExercise);
  } else {
    stats.push({
      date: today,
      sessions: [completedExercise],
    });
  }

  saveStats(stats);
};

// Get stats for the current week (Monday to Sunday)
export const getWeeklyStats = (): DailyStats[] => {
  const stats = getAllStats();
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Adjust to make Monday = 0
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedDay);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return stats.filter(s => {
    const date = new Date(s.date);
    return date >= monday && date <= sunday;
  });
};

// Get today's stats
export const getTodayStats = (): DailyStats | null => {
  const stats = getAllStats();
  const today = getTodayString();
  return stats.find(s => s.date === today) || null;
};

// Get total sessions this week
export const getWeeklySessionCount = (): number => {
  const weeklyStats = getWeeklyStats();
  return weeklyStats.reduce((total, day) => total + day.sessions.length, 0);
};

// Get total time this week in seconds
export const getWeeklyTotalTime = (): number => {
  const weeklyStats = getWeeklyStats();
  return weeklyStats.reduce((total, day) => {
    return total + day.sessions.reduce((dayTotal, session) => dayTotal + session.durationSeconds, 0);
  }, 0);
};

// Get zone distribution for the week
export const getWeeklyZoneDistribution = (): Record<Zone, { count: number; totalSeconds: number }> => {
  const weeklyStats = getWeeklyStats();
  const distribution: Record<Zone, { count: number; totalSeconds: number }> = {
    cuello: { count: 0, totalSeconds: 0 },
    hombros: { count: 0, totalSeconds: 0 },
    espalda: { count: 0, totalSeconds: 0 },
    cadera: { count: 0, totalSeconds: 0 },
    piernas: { count: 0, totalSeconds: 0 },
    de_pie: { count: 0, totalSeconds: 0 },
  };

  weeklyStats.forEach(day => {
    day.sessions.forEach(session => {
      distribution[session.zone].count += 1;
      distribution[session.zone].totalSeconds += session.durationSeconds;
    });
  });

  return distribution;
};

// Get daily session counts for the week (Monday to Sunday)
export const getWeeklyDailyCounts = (): { day: string; date: string; count: number; isToday: boolean }[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedDay);

  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const stats = getAllStats();
  const todayString = getTodayString();

  return days.map((dayLabel, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateString = date.toISOString().split('T')[0];

    const dayStats = stats.find(s => s.date === dateString);
    const count = dayStats ? dayStats.sessions.length : 0;

    return {
      day: dayLabel,
      date: dateString,
      count,
      isToday: dateString === todayString,
    };
  });
};

// Get week date range string
export const getWeekDateRange = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedDay);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return `${months[monday.getMonth()]} ${monday.getDate()} - ${months[sunday.getMonth()]} ${sunday.getDate()}`;
};

// Format seconds to minutes string
export const formatSecondsToMinutes = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  return `${minutes}min`;
};

// Export data as JSON (includes exercise history, extra exercises, and advanced settings)
export const exportAsJSON = (): void => {
  const stats = getAllStats();

  // Get enabled extra exercises and advanced settings from localStorage
  let enabledExtraExercises: number[] = [];
  let advancedSettings: unknown = null;

  try {
    const advancedStored = localStorage.getItem('focus-flow-advanced-settings');
    if (advancedStored) {
      const parsed = JSON.parse(advancedStored);
      enabledExtraExercises = parsed.enabledExtraExercises || [];
      advancedSettings = {
        enabled: parsed.enabled,
        workSchedule: parsed.workSchedule,
        notificationSchedule: parsed.notificationSchedule,
      };
    }
  } catch {
    // Ignore parsing errors
  }

  // Create comprehensive export object
  const exportData = {
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    exerciseHistory: stats,
    enabledExtraExercises,
    advancedSettings,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-flow-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export data as CSV
export const exportAsCSV = (): void => {
  const stats = getAllStats();
  const rows: string[] = ['Fecha,Hora,Ejercicio,Zona,Duración (segundos)'];

  stats.forEach(day => {
    day.sessions.forEach(session => {
      const time = new Date(session.completedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      rows.push(`${day.date},${time},"${session.name}",${session.zone},${session.durationSeconds}`);
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-flow-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Get least worked zones this week (for smart exercise selection)
export const getLeastWorkedZones = (): Zone[] => {
  const distribution = getWeeklyZoneDistribution();
  const zones = Object.entries(distribution) as [Zone, { count: number; totalSeconds: number }][];

  // Sort by count (ascending) - least worked first
  zones.sort((a, b) => a[1].count - b[1].count);

  // Return zones ordered by least worked
  return zones.map(([zone]) => zone);
};

// Get recent exercise IDs (last N completed)
export const getRecentExerciseIds = (limit: number = 5): number[] => {
  const stats = getAllStats();
  const recentIds: number[] = [];

  // Go through days in reverse (most recent first)
  for (let i = stats.length - 1; i >= 0 && recentIds.length < limit; i--) {
    const day = stats[i];
    // Go through sessions in reverse
    for (let j = day.sessions.length - 1; j >= 0 && recentIds.length < limit; j--) {
      recentIds.push(day.sessions[j].id);
    }
  }

  return recentIds;
};

// Import data from JSON file
export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    exercisesImported: number;
    extraExercisesImported: number;
    settingsImported: boolean;
  };
}

export const importFromJSON = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        let exercisesImported = 0;
        let extraExercisesImported = 0;
        let settingsImported = false;

        // Import exercise history
        if (data.exerciseHistory && Array.isArray(data.exerciseHistory)) {
          const existingStats = getAllStats();
          const existingDates = new Set(existingStats.map(s => s.date));

          // Merge with existing data (don't overwrite existing days)
          const newStats = data.exerciseHistory.filter(
            (day: DailyStats) => !existingDates.has(day.date)
          );

          if (newStats.length > 0) {
            const mergedStats = [...existingStats, ...newStats].sort(
              (a, b) => a.date.localeCompare(b.date)
            );
            saveStats(mergedStats);
            exercisesImported = newStats.reduce(
              (acc: number, day: DailyStats) => acc + day.sessions.length,
              0
            );
          }
        }

        // Import enabled extra exercises (new format v1.1.0+)
        if (data.enabledExtraExercises && Array.isArray(data.enabledExtraExercises)) {
          const advancedKey = 'focus-flow-advanced-settings';
          const existingAdvanced = localStorage.getItem(advancedKey);
          const advancedSettings = existingAdvanced
            ? JSON.parse(existingAdvanced)
            : { enabled: false, enabledExtraExercises: [] };

          const existingIds = new Set(advancedSettings.enabledExtraExercises || []);

          const newIds = data.enabledExtraExercises.filter(
            (id: number) => !existingIds.has(id)
          );

          if (newIds.length > 0) {
            advancedSettings.enabledExtraExercises = [
              ...(advancedSettings.enabledExtraExercises || []),
              ...newIds,
            ];
            localStorage.setItem(advancedKey, JSON.stringify(advancedSettings));
            extraExercisesImported = newIds.length;
          }
        }

        // Import advanced settings (optional, only if user doesn't have them)
        if (data.advancedSettings) {
          const advancedKey = 'focus-flow-advanced-settings';
          const existing = localStorage.getItem(advancedKey);

          if (!existing) {
            localStorage.setItem(advancedKey, JSON.stringify({
              ...data.advancedSettings,
              enabledExtraExercises: data.enabledExtraExercises || [],
            }));
            settingsImported = true;
          }
        }

        resolve({
          success: true,
          message: 'Datos importados correctamente',
          stats: {
            exercisesImported,
            extraExercisesImported,
            settingsImported,
          },
        });
      } catch {
        resolve({
          success: false,
          message: 'Error al leer el archivo. Asegúrate de que sea un archivo JSON válido de Focus Flow.',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Error al leer el archivo',
      });
    };

    reader.readAsText(file);
  });
};

// Helper to trigger file input for import
export const triggerImport = (): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await importFromJSON(file);
        resolve(result);
      } else {
        resolve({
          success: false,
          message: 'No se seleccionó ningún archivo',
        });
      }
    };

    input.click();
  });
};
