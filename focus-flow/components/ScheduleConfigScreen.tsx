import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { WorkScheduleConfig } from '../types';

const ScheduleConfigScreen: React.FC = () => {
  const navigate = useNavigate();
  const { advancedSettings, setWorkSchedule } = usePreferences();

  const [config, setConfig] = useState<WorkScheduleConfig>(advancedSettings.workSchedule);

  const handleSave = () => {
    // Validate that end time is after start time
    const startMinutes = config.startHour * 60 + config.startMinute;
    const endMinutes = config.endHour * 60 + config.endMinute;

    if (endMinutes <= startMinutes) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    // Minimum 4 hours of work
    if (endMinutes - startMinutes < 240) {
      alert('El horario de trabajo debe ser de al menos 4 horas');
      return;
    }

    setWorkSchedule(config);
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

  const calculateInterval = () => {
    const startMinutes = config.startHour * 60 + config.startMinute;
    const endMinutes = config.endHour * 60 + config.endMinute;
    const totalMinutes = endMinutes - startMinutes;

    if (totalMinutes <= 0) return 'Horario inválido';

    const intervalMinutes = totalMinutes / (config.sessionCount - 1);
    const hours = Math.floor(intervalMinutes / 60);
    const minutes = Math.round(intervalMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min entre sesiones`;
    }
    return `${minutes}min entre sesiones`;
  };

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
        <h1 className="text-base font-semibold tracking-wide text-gray-900 dark:text-white">Horario de trabajo</h1>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-round text-blue-500 text-xl">info</span>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Define tu jornada laboral y la cantidad de pausas activas. Las sesiones se distribuirán uniformemente.
            </p>
          </div>
        </div>

        {/* Start Time */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Hora de inicio</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <select
              aria-label="Hora de inicio"
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
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Hora de fin</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <select
              aria-label="Hora de fin"
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

        {/* Session Count */}
        <section>
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pl-1">Cantidad de sesiones</h2>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
            <div className="grid grid-cols-3 gap-2">
              {([6, 8, 12] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, sessionCount: count }))}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    config.sessionCount === count
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className={`text-2xl font-bold ${config.sessionCount === count ? 'text-primary' : 'text-gray-500'}`}>
                    {count}
                  </span>
                  <span className={`text-[10px] ${config.sessionCount === count ? 'text-primary' : 'text-gray-400'}`}>
                    sesiones
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Calculated Interval */}
        <section>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <span className="material-icons-round text-primary text-2xl mb-2">timer</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{calculateInterval()}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Pausas distribuidas de {config.startHour.toString().padStart(2, '0')}:{config.startMinute.toString().padStart(2, '0')} a {config.endHour.toString().padStart(2, '0')}:{config.endMinute.toString().padStart(2, '0')}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ScheduleConfigScreen;
