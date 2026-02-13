import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { exportAsCSV, exportAsJSON, triggerImport, ImportResult } from '../utils/stats';
import { requestNotificationPermission, isNotificationSupported, getNotificationPermission } from '../utils/notifications';
import { resetOnboarding } from './OnboardingScreen';
import { formatScheduleRange } from '../utils/sessions';
import { getEnabledExtraExerciseCount, getTotalExerciseCount } from '../utils/exerciseUtils';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, setPosture, setNotifications, setSound, advancedSettings, setAdvancedEnabled } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);

  const handlePostureToggle = (posture: 'sitting' | 'standing') => {
    const currentValue = preferences.postures[posture];
    // Solo permitir desactivar si la otra postura está activa
    const otherPosture = posture === 'sitting' ? 'standing' : 'sitting';
    if (currentValue && !preferences.postures[otherPosture]) {
      return; // No permitir desactivar la última postura activa
    }
    setPosture(posture, !currentValue);
  };

  const handleNotificationToggle = async () => {
    if (preferences.notifications) {
      // Turning off
      setNotifications(false);
    } else {
      // Turning on - request permission
      if (!isNotificationSupported()) {
        alert('Las notificaciones no están soportadas en este navegador');
        return;
      }

      const currentPermission = getNotificationPermission();
      if (currentPermission === 'denied') {
        alert('Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración del navegador.');
        return;
      }

      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifications(true);
      } else {
        alert('Se necesitan permisos de notificación para activar esta función');
      }
    }
  };

  const extraExerciseCount = getEnabledExtraExerciseCount();

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 safe-area-top flex-shrink-0">
        <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-icons-round text-2xl">chevron_left</span>
        </button>
        <h1 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white">Configuración</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-4 space-y-5">
        {/* Posture Section - Now first and more prominent */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Tipo de ejercicios</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Selecciona qué tipo de ejercicios quieres realizar. Puedes elegir ambos.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Sentado */}
              <button
                type="button"
                onClick={() => handlePostureToggle('sitting')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1.5 relative
                    ${preferences.postures.sitting
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                    }
                `}
              >
                <span className={`material-icons-round text-2xl transition-colors ${preferences.postures.sitting ? 'text-primary' : 'text-gray-400'}`}>
                  chair
                </span>
                <span className={`text-[10px] font-medium transition-colors ${preferences.postures.sitting ? 'text-primary' : 'text-gray-500'}`}>
                  Sentado
                </span>
                {preferences.postures.sitting && (
                  <span className="material-icons-round text-xs text-primary absolute top-1.5 right-1.5">check_circle</span>
                )}
              </button>

              {/* De pie */}
              <button
                type="button"
                onClick={() => handlePostureToggle('standing')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1.5 relative
                    ${preferences.postures.standing
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                    }
                `}
              >
                <span className={`material-icons-round text-2xl transition-colors ${preferences.postures.standing ? 'text-primary' : 'text-gray-400'}`}>
                  accessibility_new
                </span>
                <span className={`text-[10px] font-medium transition-colors ${preferences.postures.standing ? 'text-primary' : 'text-gray-500'}`}>
                  De pie
                </span>
                {preferences.postures.standing && (
                  <span className="material-icons-round text-xs text-primary absolute top-1.5 right-1.5">check_circle</span>
                )}
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 text-center">
              {preferences.postures.sitting && preferences.postures.standing
                ? `${getTotalExerciseCount(preferences.postures)} ejercicios disponibles`
                : preferences.postures.sitting
                ? `${getTotalExerciseCount(preferences.postures)} ejercicios sentado`
                : `${getTotalExerciseCount(preferences.postures)} ejercicios de pie`}
            </p>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Preferencias</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Notification Toggle */}
            <div className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary-light dark:bg-primary/20 p-1.5 rounded-lg">
                  <span className="material-icons-round text-primary text-lg">notifications_none</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Notificaciones</span>
              </div>
              <button
                type="button"
                aria-label="Activar o desactivar notificaciones"
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${preferences.notifications ? 'bg-primary' : 'bg-gray-300'}`}
              >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-300 ease-in-out ${preferences.notifications ? 'translate-x-5' : 'translate-x-1'}`}/>
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary-light dark:bg-primary/20 p-1.5 rounded-lg">
                  <span className="material-icons-round text-primary text-lg">volume_up</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sonidos</span>
              </div>
               <button
                type="button"
                aria-label="Activar o desactivar sonidos"
                onClick={() => setSound(!preferences.sound)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${preferences.sound ? 'bg-primary' : 'bg-gray-300'}`}
              >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-300 ease-in-out ${preferences.sound ? 'translate-x-5' : 'translate-x-1'}`}/>
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center justify-between p-3 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary-light dark:bg-primary/20 p-1.5 rounded-lg">
                  <span className="material-icons-round text-primary text-lg">dark_mode</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Tema</span>
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="material-icons-round text-sm">light_mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="material-icons-round text-sm">dark_mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="material-icons-round text-sm">settings_suggest</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Section */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Avanzado</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Advanced Toggle */}
            <div className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg transition-colors ${advancedSettings.enabled ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <span className={`material-icons-round text-lg ${advancedSettings.enabled ? 'text-amber-600' : 'text-gray-400'}`}>tune</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Modo avanzado</span>
                  <span className="text-[9px] text-gray-400">Personaliza horarios y ejercicios</span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Activar o desactivar modo avanzado"
                onClick={() => setAdvancedEnabled(!advancedSettings.enabled)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${advancedSettings.enabled ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-300 ease-in-out ${advancedSettings.enabled ? 'translate-x-5' : 'translate-x-1'}`}/>
              </button>
            </div>

            {/* Advanced Options - Only show when enabled */}
            {advancedSettings.enabled && (
              <>
                {/* Work Schedule */}
                <button
                  type="button"
                  onClick={() => navigate('/settings/schedule')}
                  className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-b border-gray-50 dark:border-gray-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                      <span className="material-icons-round text-blue-600 text-lg">schedule</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Horario de trabajo</span>
                      <span className="text-[9px] text-gray-400">
                        {formatScheduleRange()} · {advancedSettings.workSchedule.sessionCount} sesiones
                      </span>
                    </div>
                  </div>
                  <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
                </button>

                {/* Notification Hours */}
                <button
                  type="button"
                  onClick={() => navigate('/settings/notifications')}
                  className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-b border-gray-50 dark:border-gray-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${advancedSettings.notificationSchedule.enabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <span className={`material-icons-round text-lg ${advancedSettings.notificationSchedule.enabled ? 'text-purple-600' : 'text-gray-400'}`}>
                        do_not_disturb_on
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Horario de avisos</span>
                      <span className="text-[9px] text-gray-400">
                        {advancedSettings.notificationSchedule.enabled
                          ? `${String(advancedSettings.notificationSchedule.startHour).padStart(2, '0')}:${String(advancedSettings.notificationSchedule.startMinute).padStart(2, '0')} - ${String(advancedSettings.notificationSchedule.endHour).padStart(2, '0')}:${String(advancedSettings.notificationSchedule.endMinute).padStart(2, '0')}`
                          : 'Sin restricción de horario'
                        }
                      </span>
                    </div>
                  </div>
                  <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
                </button>

                {/* Extra Exercises */}
                <button
                  type="button"
                  onClick={() => navigate('/settings/exercises')}
                  className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${extraExerciseCount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <span className={`material-icons-round text-lg ${extraExerciseCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>library_add</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Añadir ejercicios</span>
                      <span className="text-[9px] text-gray-400">
                        {extraExerciseCount > 0
                          ? `${extraExerciseCount} ejercicio${extraExerciseCount > 1 ? 's' : ''} extra activo${extraExerciseCount > 1 ? 's' : ''}`
                          : 'Amplía tu catálogo de ejercicios'
                        }
                      </span>
                    </div>
                  </div>
                  <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Datos</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg text-gray-500 dark:text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <span className="material-icons-round text-lg">ios_share</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary dark:text-primary-light group-hover:text-primary-dark transition-colors">Exportar datos</span>
                    <span className="text-[9px] text-gray-400">CSV, JSON</span>
                  </div>
                </div>
                <span className={`material-icons-round text-gray-300 text-lg transition-transform ${showExportMenu ? 'rotate-90' : ''}`}>chevron_right</span>
              </button>

              {/* Export Options */}
              {showExportMenu && (
                <div className="border-t border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                  <button
                    type="button"
                    onClick={() => {
                      exportAsCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="material-icons-round text-gray-400 text-base">table_chart</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Exportar como CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportAsJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="material-icons-round text-gray-400 text-base">code</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Exportar como JSON</span>
                  </button>
                </div>
              )}
            </div>
            {/* Import Button */}
            <button
              type="button"
              onClick={async () => {
                const result = await triggerImport();
                setImportStatus(result);
                setTimeout(() => setImportStatus(null), 5000);
              }}
              className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-t border-gray-50 dark:border-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg text-gray-500 dark:text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-icons-round text-lg">file_download</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-dark transition-colors">Importar datos</span>
                  <span className="text-[9px] text-gray-400">Restaurar desde archivo JSON</span>
                </div>
              </div>
              <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
            </button>
            {/* Import Status */}
            {importStatus && (
              <div className={`p-3 border-t ${importStatus.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-start gap-2">
                  <span className={`material-icons-round text-base ${importStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                    {importStatus.success ? 'check_circle' : 'error'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs ${importStatus.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {importStatus.message}
                    </p>
                    {importStatus.stats && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {importStatus.stats.exercisesImported > 0 && `${importStatus.stats.exercisesImported} sesiones · `}
                        {importStatus.stats.extraExercisesImported > 0 && `${importStatus.stats.extraExercisesImported} ejercicios extra · `}
                        {importStatus.stats.settingsImported && 'Ajustes importados'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button
                type="button"
                onClick={() => navigate('/about')}
                className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-t border-gray-50 dark:border-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg text-gray-500 dark:text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-icons-round text-lg">info</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-dark transition-colors">Acerca de</span>
              </div>
              <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
            </button>
            <button
                type="button"
                onClick={() => {
                  if (confirm('¿Ver el tutorial de bienvenida de nuevo?')) {
                    resetOnboarding();
                    navigate('/onboarding');
                  }
                }}
                className="w-full flex items-center justify-between p-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-t border-gray-50 dark:border-gray-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg text-gray-500 dark:text-gray-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-icons-round text-lg">replay</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary-dark transition-colors">Ver tutorial</span>
              </div>
              <span className="material-icons-round text-gray-300 text-lg">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Footer - Inside scroll area */}
        <footer className="pt-4 pb-8 text-center safe-area-bottom">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-icons-round text-white text-xs">bolt</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Focus Flow v1.0.0</p>
            <p className="text-[9px] text-gray-400 opacity-70">Funciona offline</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SettingsScreen;
