export interface SessionStats {
  total: number;
  trend: number;
  focusHours: number;
}

export interface DayActivity {
  day: string;
  count: number | null;
  isToday?: boolean;
  highlight?: boolean;
  fillPercentage?: number;
}

export interface ZoneDistribution {
  name: string;
  hours: number;
  colorClass: string;
  percentage: number;
}

// Catálogo de Ejercicios
export type Zone = 'cuello' | 'hombros' | 'espalda' | 'cadera' | 'piernas' | 'de_pie';

export type Posture = 'sitting' | 'standing';

export interface ExerciseVariant {
  id: string;
  name: string;
}

export interface Exercise {
  id: number;
  name: string;
  zone: Zone;
  posture: Posture;
  durationSeconds: number;
  durationRange?: [number, number]; // [min, max] en segundos
  movement: string;
  objective: string;
  variants: ExerciseVariant[];
  icon: string; // Material icon name
  image: string; // Path to exercise illustration
}

// ===== ADVANCED SETTINGS =====

// Custom exercise created by user
export interface CustomExercise {
  id: string; // UUID to avoid conflicts with native exercises
  name: string;
  zone: Zone;
  posture: Posture;
  durationSeconds: number; // 15-45 seconds
  movement: string;
  objective: string;
  createdAt: string;
}

// Work schedule configuration
export interface WorkScheduleConfig {
  startHour: number;   // 0-23
  startMinute: number; // 0-59
  endHour: number;     // 0-23
  endMinute: number;   // 0-59
  sessionCount: 6 | 8 | 12;
}

// Extended notification schedule (quiet hours inverse)
export interface NotificationScheduleConfig {
  enabled: boolean;
  startHour: number;   // When notifications can start (e.g., 7)
  startMinute: number;
  endHour: number;     // When notifications must stop (e.g., 22)
  endMinute: number;
  maxSessions: 6 | 8 | 12 | 16 | 20 | 24;
}

// Complete advanced settings structure
export interface AdvancedSettings {
  enabled: boolean; // Master toggle
  workSchedule: WorkScheduleConfig;
  notificationSchedule: NotificationScheduleConfig;
  customExercises: CustomExercise[];
}

// Default values for advanced settings
export const DEFAULT_WORK_SCHEDULE: WorkScheduleConfig = {
  startHour: 10,
  startMinute: 0,
  endHour: 17,
  endMinute: 0,
  sessionCount: 6,
};

export const DEFAULT_NOTIFICATION_SCHEDULE: NotificationScheduleConfig = {
  enabled: false,
  startHour: 8,
  startMinute: 0,
  endHour: 22,
  endMinute: 0,
  maxSessions: 12,
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  enabled: false,
  workSchedule: DEFAULT_WORK_SCHEDULE,
  notificationSchedule: DEFAULT_NOTIFICATION_SCHEDULE,
  customExercises: [],
};
