import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { CustomExercise, Zone } from '../types';
import { ZONE_LABELS } from '../data/exercises';
import {
  generateExerciseId,
  validateCustomExercise,
  EXERCISE_VALIDATION,
  ZONE_ICONS,
  canAddMoreExercises,
} from '../utils/customExercises';

const ZONE_OPTIONS: { value: Zone; label: string }[] = [
  { value: 'cuello', label: 'Cuello' },
  { value: 'hombros', label: 'Hombros' },
  { value: 'espalda', label: 'Espalda' },
  { value: 'cadera', label: 'Cadera' },
  { value: 'piernas', label: 'Piernas' },
  { value: 'de_pie', label: 'De pie' },
];

const CustomExercisesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { advancedSettings, addCustomExercise, deleteCustomExercise } = usePreferences();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    zone: 'cuello' as Zone,
    posture: 'sitting' as 'sitting' | 'standing',
    durationSeconds: 30,
    movement: '',
    objective: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleCreate = () => {
    const validation = validateCustomExercise(formData);

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const newExercise: CustomExercise = {
      id: generateExerciseId(),
      ...formData,
      name: formData.name.trim(),
      movement: formData.movement.trim(),
      objective: formData.objective.trim(),
      createdAt: new Date().toISOString(),
    };

    addCustomExercise(newExercise);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      zone: 'cuello',
      posture: 'sitting',
      durationSeconds: 30,
      movement: '',
      objective: '',
    });
    setFormErrors([]);
  };

  const handleDelete = (id: string) => {
    deleteCustomExercise(id);
    setDeleteConfirm(null);
  };

  const customExercises = advancedSettings.customExercises;

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 safe-area-top flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-icons-round text-2xl">chevron_left</span>
        </button>
        <h1 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white">Mis ejercicios</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-4 space-y-4">
        {/* Info */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-round text-green-500 text-xl">info</span>
            <div className="text-xs text-green-700 dark:text-green-300">
              <p>Crea ejercicios personalizados que se mezclarán con los predefinidos.</p>
              <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">
                Máximo {EXERCISE_VALIDATION.maxExercises} ejercicios · Duración {EXERCISE_VALIDATION.duration.min}-{EXERCISE_VALIDATION.duration.max}s
              </p>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        {customExercises.length > 0 ? (
          <section>
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">
              {customExercises.length} ejercicio{customExercises.length > 1 ? 's' : ''} creado{customExercises.length > 1 ? 's' : ''}
            </h2>
            <div className="space-y-2">
              {customExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
                      <span className="material-icons-round text-green-600 text-lg">
                        {ZONE_ICONS[exercise.zone]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {exercise.name}
                        </span>
                        <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded flex-shrink-0">
                          {exercise.durationSeconds}s
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{ZONE_LABELS[exercise.zone]}</span>
                        <span>·</span>
                        <span>{exercise.posture === 'sitting' ? 'Sentado' : 'De pie'}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        {exercise.movement}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(exercise.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <span className="material-icons-round text-lg">delete</span>
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === exercise.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-red-500">¿Eliminar este ejercicio?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exercise.id)}
                          className="text-xs text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="material-icons-round text-gray-400 text-3xl">fitness_center</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No tienes ejercicios personalizados</p>
            <p className="text-[10px] text-gray-400 mt-1">Crea tu primer ejercicio</p>
          </div>
        )}

        {/* Add Button */}
        {canAddMoreExercises() && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-icons-round">add</span>
            <span>Crear ejercicio</span>
          </button>
        )}

        {!canAddMoreExercises() && (
          <p className="text-center text-xs text-gray-400">
            Has alcanzado el límite de {EXERCISE_VALIDATION.maxExercises} ejercicios
          </p>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-500"
              >
                Cancelar
              </button>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Nuevo ejercicio</h2>
              <button
                type="button"
                onClick={handleCreate}
                className="text-green-500 font-medium"
              >
                Crear
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Errors */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                    {formErrors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Nombre del ejercicio
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Rotación de muñecas"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm"
                  maxLength={EXERCISE_VALIDATION.name.max}
                />
              </div>

              {/* Zone */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Zona del cuerpo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ZONE_OPTIONS.map((zone) => (
                    <button
                      key={zone.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, zone: zone.value }))}
                      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.zone === zone.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <span className={`material-icons-round text-lg ${formData.zone === zone.value ? 'text-green-600' : 'text-gray-400'}`}>
                        {ZONE_ICONS[zone.value]}
                      </span>
                      <span className={`text-[9px] ${formData.zone === zone.value ? 'text-green-600' : 'text-gray-500'}`}>
                        {zone.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Posture */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Postura
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, posture: 'sitting' }))}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.posture === 'sitting'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <span className={`material-icons-round ${formData.posture === 'sitting' ? 'text-green-600' : 'text-gray-400'}`}>chair</span>
                    <span className={`text-sm ${formData.posture === 'sitting' ? 'text-green-600' : 'text-gray-500'}`}>Sentado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, posture: 'standing' }))}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.posture === 'standing'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <span className={`material-icons-round ${formData.posture === 'standing' ? 'text-green-600' : 'text-gray-400'}`}>accessibility_new</span>
                    <span className={`text-sm ${formData.posture === 'standing' ? 'text-green-600' : 'text-gray-500'}`}>De pie</span>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Duración: {formData.durationSeconds} segundos
                </label>
                <input
                  type="range"
                  aria-label="Duración del ejercicio"
                  min={EXERCISE_VALIDATION.duration.min}
                  max={EXERCISE_VALIDATION.duration.max}
                  value={formData.durationSeconds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, durationSeconds: parseInt(e.target.value) }))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>{EXERCISE_VALIDATION.duration.min}s</span>
                  <span>{EXERCISE_VALIDATION.duration.max}s</span>
                </div>
              </div>

              {/* Movement */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Descripción del movimiento
                </label>
                <textarea
                  value={formData.movement}
                  onChange={(e) => setFormData((prev) => ({ ...prev, movement: e.target.value }))}
                  placeholder="Describe cómo realizar el ejercicio paso a paso..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm resize-none"
                  maxLength={EXERCISE_VALIDATION.movement.max}
                />
              </div>

              {/* Objective */}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 block">
                  Objetivo del ejercicio
                </label>
                <input
                  type="text"
                  value={formData.objective}
                  onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="Ej: Aliviar tensión en la zona cervical"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm"
                  maxLength={EXERCISE_VALIDATION.objective.max}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomExercisesScreen;
