// Extra Exercises utility
// Handles enabled extra exercises and merges them with native exercises

import { Exercise } from '../types';
import { exercises as nativeExercises } from '../data/exercises';
import { extraExercises } from '../data/extraExercises';

const ADVANCED_SETTINGS_KEY = 'focus-flow-advanced-settings';

// Get enabled extra exercise IDs from localStorage
export const getEnabledExtraExerciseIds = (): number[] => {
  try {
    const stored = localStorage.getItem(ADVANCED_SETTINGS_KEY);
    if (!stored) return [];

    const settings = JSON.parse(stored);
    return settings.enabledExtraExercises || [];
  } catch {
    return [];
  }
};

// Get enabled extra exercises as Exercise objects
export const getEnabledExtraExercises = (): Exercise[] => {
  const enabledIds = getEnabledExtraExerciseIds();
  return extraExercises.filter((e) => enabledIds.includes(e.id));
};

// Get all exercises (native + enabled extra) based on preferences
export const getAllExercises = (
  posturePrefs: { sitting: boolean; standing: boolean }
): Exercise[] => {
  const enabledExtra = getEnabledExtraExercises();

  // Filter native exercises by posture
  const filteredNative = nativeExercises.filter(
    (e) =>
      (e.posture === 'sitting' && posturePrefs.sitting) ||
      (e.posture === 'standing' && posturePrefs.standing)
  );

  // Filter enabled extra exercises by posture
  const filteredExtra = enabledExtra.filter(
    (e) =>
      (e.posture === 'sitting' && posturePrefs.sitting) ||
      (e.posture === 'standing' && posturePrefs.standing)
  );

  return [...filteredNative, ...filteredExtra];
};

// Get count of enabled extra exercises
export const getEnabledExtraExerciseCount = (): number => {
  return getEnabledExtraExerciseIds().length;
};

// Get total exercise count based on posture preferences
export const getTotalExerciseCount = (posturePrefs: { sitting: boolean; standing: boolean }): number => {
  return getAllExercises(posturePrefs).length;
};
