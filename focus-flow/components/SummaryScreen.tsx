import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Zone } from '../types';
import { ZONE_LABELS } from '../data/exercises';
import {
  getWeeklySessionCount,
  getWeeklyTotalTime,
  getWeeklyZoneDistribution,
  getWeeklyDailyCounts,
  getWeekDateRange,
} from '../utils/stats';
import { SCHEDULED_SESSIONS } from '../utils/sessions';

const ZONE_COLORS: Record<Zone, string> = {
  cuello: 'bg-purple-500',
  hombros: 'bg-blue-500',
  espalda: 'bg-green-500',
  cadera: 'bg-orange-500',
  piernas: 'bg-red-500',
  de_pie: 'bg-teal-500',
};

const SummaryScreen: React.FC = () => {
  const location = useLocation();

  // State for stats that refresh on navigation
  const [weeklySessionCount, setWeeklySessionCount] = useState(0);
  const [weeklyTotalTime, setWeeklyTotalTime] = useState(0);
  const [zoneDistribution, setZoneDistribution] = useState(getWeeklyZoneDistribution());
  const [dailyCounts, setDailyCounts] = useState(getWeeklyDailyCounts());
  const [weekDateRange, setWeekDateRange] = useState('');

  // Refresh stats when component mounts or when navigating to this screen
  useEffect(() => {
    setWeeklySessionCount(getWeeklySessionCount());
    setWeeklyTotalTime(getWeeklyTotalTime());
    setZoneDistribution(getWeeklyZoneDistribution());
    setDailyCounts(getWeeklyDailyCounts());
    setWeekDateRange(getWeekDateRange());
  }, [location.key]);

  // Calculate max sessions per day for scaling the chart
  const maxDailyCount = Math.max(...dailyCounts.map(d => d.count), SCHEDULED_SESSIONS.length);

  // Format total time
  const formatTotalTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get zones with activity, sorted by count
  const activeZones = useMemo(() => {
    return Object.entries(zoneDistribution)
      .filter(([, data]) => data.count > 0)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([zone, data]) => ({
        zone: zone as Zone,
        ...data,
      }));
  }, [zoneDistribution]);

  // Calculate total for percentage
  const totalZoneCount = activeZones.reduce((sum, z) => sum + z.count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 flex justify-between items-center bg-white dark:bg-[#25152b] sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div>
          <h2 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resumen</h2>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-0.5">Sesiones esta semana</h1>
        </div>
        <button type="button" className="p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition-colors">
          <span className="material-icons-round text-xl">calendar_today</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-4 overflow-y-auto">
        {/* KPI Cards */}
        <div className="flex space-x-3 mb-5">
          <div className="flex-1 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <span className="block text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Sesiones</span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">{weeklySessionCount}</span>
            </div>
          </div>
          <div className="flex-1 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
            <span className="block text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tiempo Total</span>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                {weeklyTotalTime > 0 ? formatTotalTime(weeklyTotalTime) : '0min'}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <section className="mb-5">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Actividad Diaria</h3>
            <span className="text-[10px] text-gray-400">{weekDateRange}</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 h-24">
            {dailyCounts.map((data, index) => {
              const fillPercentage = maxDailyCount > 0 ? (data.count / maxDailyCount) * 100 : 0;
              const isFutureDay = new Date(data.date) > new Date();

              return (
                <div key={index} className="flex flex-col items-center h-full justify-end">
                  <div
                    className={`
                      w-full rounded-md flex flex-col justify-end items-center pb-1.5 relative overflow-hidden group transition-all duration-300 h-full
                      ${data.isToday
                        ? 'bg-transparent ring-1 ring-primary ring-offset-1 ring-offset-white dark:ring-offset-[#25152b]'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                      }
                    `}
                  >
                    {/* Fill Bar */}
                    {!isFutureDay ? (
                      <>
                        <div
                          className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${data.isToday ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-primary/20'}`}
                          style={{ height: `${fillPercentage}%` }}
                        ></div>
                        <span className={`text-xs font-medium z-10 ${data.isToday ? 'text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                          {data.count > 0 ? data.count : ''}
                        </span>
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-300 dark:text-gray-600">-</span>
                      </div>
                    )}
                  </div>
                  <span className={`mt-1 text-[10px] font-medium ${data.isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Zone Distribution */}
        <section className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Distribución por Zona</h3>
          {activeZones.length > 0 ? (
            <div className="space-y-3">
              {activeZones.map(({ zone, count }) => {
                const percentage = totalZoneCount > 0 ? (count / totalZoneCount) * 100 : 0;
                return (
                  <div key={zone}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full ${ZONE_COLORS[zone]} mr-2`}></span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{ZONE_LABELS[zone]}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {count} {count === 1 ? 'sesión' : 'sesiones'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                      <div className={`${ZONE_COLORS[zone]} h-1 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500">
              <span className="material-icons-round text-3xl mb-2 block opacity-50">fitness_center</span>
              <p className="text-xs">Aún no has completado ejercicios esta semana</p>
            </div>
          )}
        </section>

        {/* Insight Card */}
        {weeklySessionCount > 0 && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
            <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex-shrink-0">
              <span className="material-icons-round text-primary text-lg">insights</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                {weeklySessionCount >= 6 ? '¡Excelente semana!' : weeklySessionCount >= 3 ? '¡Buen progreso!' : '¡Sigue así!'}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {weeklySessionCount >= 6
                  ? 'Has mantenido un ritmo constante de pausas activas.'
                  : `Llevas ${weeklySessionCount} ${weeklySessionCount === 1 ? 'sesión' : 'sesiones'} esta semana. ¡Cada pausa cuenta!`}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SummaryScreen;
