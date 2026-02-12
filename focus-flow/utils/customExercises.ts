// Custom Exercises utility
// Handles validation and integration of user-created exercises

import { CustomExercise, Exercise, Zone } from '../types';
import { exercises as nativeExercises } from '../data/exercises';

const ADVANCED_SETTINGS_KEY = 'focus-flow-advanced-settings';

// Zone icons for custom exercises (since they don't have images)
export const ZONE_ICONS: Record<Zone, string> = {
  cuello: 'self_improvement',
  hombros: 'accessibility',
  espalda: 'airline_seat_recline_normal',
  cadera: 'directions_walk',
  piernas: 'directions_run',
  de_pie: 'accessibility_new',
};

// Validation constants
export const EXERCISE_VALIDATION = {
  name: { min: 3, max: 50 },
  movement: { min: 10, max: 200 },
  objective: { min: 10, max: 100 },
  duration: { min: 15, max: 45 },
  maxExercises: 20,
};

// Generate a unique ID for custom exercises
export const generateExerciseId = (): string => {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validation functions
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateExerciseName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (trimmed.length < EXERCISE_VALIDATION.name.min) {
    errors.push(`El nombre debe tener al menos ${EXERCISE_VALIDATION.name.min} caracteres`);
  }
  if (trimmed.length > EXERCISE_VALIDATION.name.max) {
    errors.push(`El nombre no puede exceder ${EXERCISE_VALIDATION.name.max} caracteres`);
  }

  return { valid: errors.length === 0, errors };
};

export const validateExerciseMovement = (movement: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = movement.trim();

  if (trimmed.length < EXERCISE_VALIDATION.movement.min) {
    errors.push(`La descripción del movimiento debe tener al menos ${EXERCISE_VALIDATION.movement.min} caracteres`);
  }
  if (trimmed.length > EXERCISE_VALIDATION.movement.max) {
    errors.push(`La descripción no puede exceder ${EXERCISE_VALIDATION.movement.max} caracteres`);
  }

  return { valid: errors.length === 0, errors };
};

export const validateExerciseObjective = (objective: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = objective.trim();

  if (trimmed.length < EXERCISE_VALIDATION.objective.min) {
    errors.push(`El objetivo debe tener al menos ${EXERCISE_VALIDATION.objective.min} caracteres`);
  }
  if (trimmed.length > EXERCISE_VALIDATION.objective.max) {
    errors.push(`El objetivo no puede exceder ${EXERCISE_VALIDATION.objective.max} caracteres`);
  }

  return { valid: errors.length === 0, errors };
};

export const validateExerciseDuration = (duration: number): ValidationResult => {
  const errors: string[] = [];

  if (duration < EXERCISE_VALIDATION.duration.min) {
    errors.push(`La duración mínima es ${EXERCISE_VALIDATION.duration.min} segundos`);
  }
  if (duration > EXERCISE_VALIDATION.duration.max) {
    errors.push(`La duración máxima es ${EXERCISE_VALIDATION.duration.max} segundos`);
  }

  return { valid: errors.length === 0, errors };
};

export const validateCustomExercise = (exercise: Omit<CustomExercise, 'id' | 'createdAt'>): ValidationResult => {
  const allErrors: string[] = [];

  const nameResult = validateExerciseName(exercise.name);
  const movementResult = validateExerciseMovement(exercise.movement);
  const objectiveResult = validateExerciseObjective(exercise.objective);
  const durationResult = validateExerciseDuration(exercise.durationSeconds);

  allErrors.push(...nameResult.errors);
  allErrors.push(...movementResult.errors);
  allErrors.push(...objectiveResult.errors);
  allErrors.push(...durationResult.errors);

  return { valid: allErrors.length === 0, errors: allErrors };
};

// Get custom exercises from localStorage
export const getCustomExercises = (): CustomExercise[] => {
  try {
    const stored = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (!stored) return [];

    const settings = JSON.parse(stored);
    return settings.customExercises || [];
  } catch {
    return [];
  }
};

// Map zones to fallback images (using existing exercise images that match the zone)
const ZONE_FALLBACK_IMAGES: Record<Zone, string> = {
  cuello: '/exercises/exercise_1.png',    // Neck exercise image
  hombros: '/exercises/exercise_4.png',   // Shoulder exercise image
  espalda: '/exercises/exercise_7.png',   // Back exercise image
  cadera: '/exercises/exercise_10.png',   // Hip exercise image
  piernas: '/exercises/exercise_13.png',  // Legs exercise image
  de_pie: '/exercises/exercise_16.png',   // Standing exercise image
};

// Convert a CustomExercise to the Exercise interface for use in the app
export const customToExercise = (custom: CustomExercise): Exercise => {
  // Use a high ID range to avoid conflicts with native exercises (native are 1-18)
  const numericId = parseInt(custom.id.replace(/\D/g, '').slice(-6)) || Date.now();

  return {
    id: 1000 + (numericId % 10000), // IDs start at 1000 for custom
    name: custom.name,
    zone: custom.zone,
    posture: custom.posture,
    durationSeconds: custom.durationSeconds,
    movement: custom.movement,
    objective: custom.objective,
    variants: [],
    icon: ZONE_ICONS[custom.zone],
    image: ZONE_FALLBACK_IMAGES[custom.zone],
  };
};

// Get all exercises (native + custom) based on preferences
export const getAllExercises = (
  posturePrefs: { sitting: boolean; standing: boolean }
): Exercise[] => {
  const customExercises = getCustomExercises();

  // Filter native exercises by posture
  const filteredNative = nativeExercises.filter(
    (e) =>
      (e.posture === 'sitting' && posturePrefs.sitting) ||
      (e.posture === 'standing' && posturePrefs.standing)
  );

  // Filter and convert custom exercises
  const filteredCustom = customExercises
    .filter(
      (e) =>
        (e.posture === 'sitting' && posturePrefs.sitting) ||
        (e.posture === 'standing' && posturePrefs.standing)
    )
    .map(customToExercise);

  return [...filteredNative, ...filteredCustom];
};

// Check if we can add more custom exercises
export const canAddMoreExercises = (): boolean => {
  const current = getCustomExercises();
  return current.length < EXERCISE_VALIDATION.maxExercises;
};

// Get count of custom exercises
export const getCustomExerciseCount = (): number => {
  return getCustomExercises().length;
};
