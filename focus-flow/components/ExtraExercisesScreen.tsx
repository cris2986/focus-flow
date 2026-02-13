import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { Zone } from '../types';
import { ZONE_LABELS } from '../data/exercises';
import { extraExercises, getExtraExerciseIdsByZone } from '../data/extraExercises';

const ZONE_OPTIONS: { value: Zone; label: string; icon: string; bgClass: string; iconClass: string }[] = [
  { value: 'cuello', label: 'Cuello', icon: 'self_improvement', bgClass: 'bg-purple-100 dark:bg-purple-900/30', iconClass: 'text-purple-500' },
  { value: 'hombros', label: 'Hombros', icon: 'accessibility', bgClass: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-500' },
  { value: 'espalda', label: 'Espalda', icon: 'airline_seat_recline_normal', bgClass: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-500' },
  { value: 'cadera', label: 'Cadera', icon: 'directions_walk', bgClass: 'bg-orange-100 dark:bg-orange-900/30', iconClass: 'text-orange-500' },
  { value: 'piernas', label: 'Piernas', icon: 'directions_run', bgClass: 'bg-red-100 dark:bg-red-900/30', iconClass: 'text-red-500' },
  { value: 'de_pie', label: 'De pie', icon: 'accessibility_new', bgClass: 'bg-teal-100 dark:bg-teal-900/30', iconClass: 'text-teal-500' },
];

const ExtraExercisesScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    advancedSettings,
    toggleExtraExercise,
    enableExtraExercisesByZone,
    disableExtraExercisesByZone,
    isExtraExerciseEnabled,
  } = usePreferences();

  const [expandedZone, setExpandedZone] = useState<Zone | null>(null);
  const [previewExercise, setPreviewExercise] = useState<number | null>(null);

  const enabledCount = (advancedSettings.enabledExtraExercises || []).length;

  const getZoneEnabledCount = (zone: Zone): number => {
    const zoneIds = getExtraExerciseIdsByZone(zone);
    return zoneIds.filter((id) => isExtraExerciseEnabled(id)).length;
  };

  const isZoneFullyEnabled = (zone: Zone): boolean => {
    const zoneIds = getExtraExerciseIdsByZone(zone);
    return zoneIds.every((id) => isExtraExerciseEnabled(id));
  };

  const toggleZone = (zone: Zone) => {
    const zoneIds = getExtraExerciseIdsByZone(zone);
    if (isZoneFullyEnabled(zone)) {
      disableExtraExercisesByZone(zoneIds);
    } else {
      enableExtraExercisesByZone(zoneIds);
    }
  };

  const getZoneExercises = (zone: Zone) => {
    return extraExercises.filter((e) => e.zone === zone);
  };

  const previewEx = previewExercise ? extraExercises.find((e) => e.id === previewExercise) : null;

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
        <h1 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white">Añadir ejercicios</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-4 space-y-4">
        {/* Info */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-round text-green-500 text-xl">library_add</span>
            <div className="text-xs text-green-700 dark:text-green-300">
              <p>Activa ejercicios adicionales para ampliar tu catálogo.</p>
              <p className="mt-1 text-[10px] text-green-600 dark:text-green-400">
                {enabledCount} ejercicio{enabledCount !== 1 ? 's' : ''} extra activo{enabledCount !== 1 ? 's' : ''} · 36 disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Zone Sections */}
        {ZONE_OPTIONS.map((zone) => {
          const zoneExercises = getZoneExercises(zone.value);
          const enabledInZone = getZoneEnabledCount(zone.value);
          const isExpanded = expandedZone === zone.value;
          const isFullyEnabled = isZoneFullyEnabled(zone.value);

          return (
            <section key={zone.value} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Zone Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedZone(isExpanded ? null : zone.value)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${zone.bgClass} flex items-center justify-center`}>
                    <span className={`material-icons-round ${zone.iconClass} text-xl`}>{zone.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-900 dark:text-white">{zone.label}</h2>
                    <p className="text-[10px] text-gray-400">
                      {enabledInZone} de 6 activos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle all button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleZone(zone.value);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isFullyEnabled
                        ? 'bg-green-500 text-white'
                        : enabledInZone > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {isFullyEnabled ? 'Todos' : enabledInZone > 0 ? `${enabledInZone}/6` : 'Ninguno'}
                  </button>
                  <span className={`material-icons-round text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </div>

              {/* Exercises List */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  {zoneExercises.map((exercise) => {
                    const isEnabled = isExtraExerciseEnabled(exercise.id);
                    return (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewExercise(exercise.id)}
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            <span className="material-icons-round text-lg">info</span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                              {exercise.name}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {exercise.durationSeconds}s · {exercise.posture === 'sitting' ? 'Sentado' : 'De pie'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExtraExercise(exercise.id)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${
                            isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-300 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const allIds = extraExercises.map((e) => e.id);
              enableExtraExercisesByZone(allIds);
            }}
            className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl text-sm transition-colors"
          >
            Activar todos
          </button>
          <button
            type="button"
            onClick={() => {
              const allIds = extraExercises.map((e) => e.id);
              disableExtraExercisesByZone(allIds);
            }}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl text-sm transition-colors"
          >
            Desactivar todos
          </button>
        </div>
      </main>

      {/* Preview Modal */}
      {previewEx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setPreviewExercise(null)}
        >
          <div
            className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{previewEx.name}</h2>
              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-semibold text-gray-400">Zona</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">{ZONE_LABELS[previewEx.zone]}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-semibold text-gray-400">Postura</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {previewEx.posture === 'sitting' ? 'Sentado' : 'De pie'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-semibold text-gray-400">Duración</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">{previewEx.durationSeconds} segundos</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">Movimiento</span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{previewEx.movement}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">Objetivo</span>
                <p className="text-sm text-gray-700 dark:text-gray-200">{previewEx.objective}</p>
              </div>

              {/* Toggle in modal */}
              <button
                type="button"
                onClick={() => {
                  toggleExtraExercise(previewEx.id);
                }}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
                  isExtraExerciseEnabled(previewEx.id)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isExtraExerciseEnabled(previewEx.id) ? 'Desactivar ejercicio' : 'Activar ejercicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraExercisesScreen;
