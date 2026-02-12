import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { NotificationScheduleConfig } from '../types';

const NotificationScheduleScreen: React.FC = () => {
  const navigate = useNavigate();
  const { advancedSettings, setNotificationSchedule } = usePreferences();

  const [config, setConfig] = useState<NotificationScheduleConfig>(advancedSettings.notificationSchedule);

  const handleSave = () => {
    if (config.enabled) {
      // Validate that end time is after start time
      const startMinutes = config.startHour * 60 + config.startMinute;
      const endMinutes = config.endHour * 60 + config.endMinute;

      if (endMinutes <= startMinutes) {
        alert('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }
    }

    setNotificationSchedule(config);
    navigate('/settings');
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        options.push({ hour: h, minute: m, label });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

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
        <h1 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white">Horario de avisos</h1>
        <button
          type="button"
          onClick={handleSave}
          className="text-primary font-medium text-sm"
        >
          Guardar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-4 space-y-5">
        {/* Info */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-round text-purple-500 text-xl">info</span>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Limita las notificaciones a un horario específico para evitar interrupciones fuera de horas activas.
            </p>
          </div>
        </div>

        {/* Enable Toggle */}
        <section>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.enabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <span className={`material-icons-round text-xl ${config.enabled ? 'text-purple-600' : 'text-gray-400'}`}>
                    do_not_disturb_on
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Restringir horario</span>
                  <span className="text-[10px] text-gray-400">Sólo notificar en horas activas</span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Activar restricción de horario"
                onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${config.enabled ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${config.enabled ? 'translate-x-7' : 'translate-x-1'}`}/>
              </button>
            </div>
          </div>
        </section>

        {/* Time Configuration - Only show when enabled */}
        {config.enabled && (
          <>
            {/* Start Time */}
            <section>
              <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Avisos desde</h2>
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                <select
                  aria-label="Avisos desde"
                  value={`${config.startHour}:${config.startMinute}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setConfig((prev) => ({ ...prev, startHour: h, startMinute: m }));
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-lg font-medium text-center"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.label} value={`${opt.hour}:${opt.minute}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* End Time */}
            <section>
              <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Avisos hasta</h2>
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                <select
                  aria-label="Avisos hasta"
                  value={`${config.endHour}:${config.endMinute}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    setConfig((prev) => ({ ...prev, endHour: h, endMinute: m }));
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-lg font-medium text-center"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.label} value={`${opt.hour}:${opt.minute}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Max Sessions for extended hours */}
            <section>
              <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Máximo de sesiones diarias</h2>
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                <div className="grid grid-cols-3 gap-2">
                  {([6, 8, 12] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, maxSessions: count }))}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        config.maxSessions === count
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <span className={`text-lg font-bold ${config.maxSessions === count ? 'text-purple-600' : 'text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {([16, 20, 24] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, maxSessions: count }))}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        config.maxSessions === count
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <span className={`text-lg font-bold ${config.maxSessions === count ? 'text-purple-600' : 'text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Summary */}
            <section>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <span className="material-icons-round text-purple-500 text-2xl mb-2">notifications_active</span>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Notificaciones de {config.startHour.toString().padStart(2, '0')}:{config.startMinute.toString().padStart(2, '0')} a {config.endHour.toString().padStart(2, '0')}:{config.endMinute.toString().padStart(2, '0')}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Máximo {config.maxSessions} sesiones por día
                </p>
              </div>
            </section>
          </>
        )}

        {/* Disabled state info */}
        {!config.enabled && (
          <section>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <span className="material-icons-round text-gray-400 text-2xl mb-2">notifications</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Las notificaciones se enviarán según el horario de trabajo configurado
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default NotificationScheduleScreen;
