import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ZONE_LABELS } from '../data/exercises';
import { Exercise } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import {
  getNextSession,
  getTodayCompletedSessions,
  getScheduledSessions,
  isSessionTime,
  getTimeUntilNextSession,
  formatTimeUntil,
  isCurrentSessionCompleted,
} from '../utils/sessions';
import { showSessionReminder } from '../utils/notifications';
import { getLeastWorkedZones, getRecentExerciseIds } from '../utils/stats';
import { getAllExercises } from '../utils/customExercises';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = usePreferences();

  // Session tracking
  const [nextSession, setNextSession] = useState(getNextSession());
  const [isActiveSession, setIsActiveSession] = useState(() => isSessionTime(5) && !isCurrentSessionCompleted());
  const [timeUntil, setTimeUntil] = useState(getTimeUntilNextSession());
  const [completedToday, setCompletedToday] = useState(getTodayCompletedSessions());
  const scheduledSessions = getScheduledSessions();
  const totalSessions = scheduledSessions.length;
  const completedCount = completedToday.length;

  // Track if notification was shown for current session
  const notificationShownRef = useRef<number | null>(null);

  // Refresh session state when returning to this screen (e.g., after completing a session)
  useEffect(() => {
    setNextSession(getNextSession());
    setIsActiveSession(isSessionTime(5) && !isCurrentSessionCompleted());
    setTimeUntil(getTimeUntilNextSession());
    setCompletedToday(getTodayCompletedSessions());
  }, [location.key]);

  // Update session state every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const wasActive = isActiveSession;
      const nowActive = isSessionTime(5) && !isCurrentSessionCompleted();

      setNextSession(getNextSession());
      setIsActiveSession(nowActive);
      setTimeUntil(getTimeUntilNextSession());

      // Show notification when session becomes active
      if (!wasActive && nowActive && preferences.notifications) {
        const currentSession = getNextSession();
        if (currentSession && notificationShownRef.current !== currentSession.id) {
          showSessionReminder(() => {
            // When user clicks the notification, focus app and it's ready to start
            window.focus();
          });
          notificationShownRef.current = currentSession.id;
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isActiveSession, preferences.notifications]);

  // Get all exercises (native + custom) based on user's posture preferences
  const filteredExercises = useMemo(() => {
    return getAllExercises(preferences.postures);
  }, [preferences.postures]);

  // Smart exercise selection: prioritizes least worked zones and avoids recent exercises
  const getSmartExercise = useCallback((excludeId?: number): Exercise => {
    const available = filteredExercises.filter(e => e.id !== excludeId);
    if (available.length === 0) {
      if (filteredExercises.length > 0) return filteredExercises[0];
      // Return current exercise if no alternatives
      return currentExercise;
    }

    const leastWorkedZones = getLeastWorkedZones();
    const recentIds = getRecentExerciseIds(5);

    // Score each exercise: lower score = better choice
    const scored = available.map(exercise => {
      let score = 0;
      // Zone priority: least worked zones get lower scores
      const zoneIndex = leastWorkedZones.indexOf(exercise.zone);
      score += zoneIndex * 10;
      // Recently done penalty
      if (recentIds.includes(exercise.id)) {
        score += 50;
      }
      // Add small random factor for variety
      score += Math.random() * 5;
      return { exercise, score };
    });

    // Sort by score and pick the best
    scored.sort((a, b) => a.score - b.score);
    return scored[0].exercise;
  }, [filteredExercises]);

  const [currentExercise, setCurrentExercise] = useState<Exercise>(() => {
    const available = getAllExercises(preferences.postures);
    if (available.length === 0) {
      // Fallback to a default exercise structure
      return {
        id: 0,
        name: 'Sin ejercicios',
        zone: 'cuello',
        posture: 'sitting',
        durationSeconds: 30,
        movement: 'No hay ejercicios disponibles',
        objective: 'Configura tus preferencias',
        variants: [],
        image: '/exercises/exercise_1.png',
        icon: 'self_improvement',
      };
    }
    // Initial selection is random, smart selection kicks in on skip/refresh
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  });

  // Update current exercise if it's no longer in filtered list
  useEffect(() => {
    const isCurrentValid = filteredExercises.some(e => e.id === currentExercise.id);
    if (!isCurrentValid && filteredExercises.length > 0) {
      setCurrentExercise(getSmartExercise());
    }
  }, [filteredExercises, currentExercise.id, getSmartExercise]);

  const handleSkip = () => {
    setCurrentExercise(getSmartExercise(currentExercise.id));
  };

  // Reduced from 120 to 60 dots for better performance
  const dots = useMemo(() =>
    Array.from({ length: 60 }).map((_, i) => {
      const angle = (i / 60) * 2 * Math.PI;
      const radius = 46;
      const cx = 50 + radius * Math.cos(angle);
      const cy = 50 + radius * Math.sin(angle);
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="0.8"
          fill="currentColor"
        />
      );
    }), []
  );

  const handleStart = () => {
    navigate('/session', { state: { exercise: currentExercise } });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="safe-area-top px-4 pt-3 pb-2 flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActiveSession ? 'bg-primary animate-pulse' : 'bg-primary/10'}`}>
            <span className={`material-icons-round text-base ${isActiveSession ? 'text-white' : 'text-primary'}`}>all_inclusive</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Focus Flow</h1>
          {isActiveSession && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${isActiveSession ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
          {isActiveSession && (
            <span className="material-icons-round text-green-600 dark:text-green-400 text-xs mr-0.5">fiber_manual_record</span>
          )}
          <span className={`text-[10px] font-semibold ${isActiveSession ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>{completedCount}/{totalSessions}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-4 relative z-0 min-h-0">
        {/* Background Blobs */}
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {isActiveSession ? (
          // ===== ACTIVE SESSION VIEW =====
          <>
            {/* Card */}
            <div className="bg-white dark:bg-[#2a1b30] rounded-2xl p-4 shadow-card border border-gray-100 dark:border-white/5 flex flex-col items-center gap-3 w-full">
              {/* Illustration */}
              <div className="w-full h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/0 rounded-xl flex items-center justify-center overflow-hidden relative">
                {/* Dotted Circle Animation */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <svg
                    className="w-[90%] h-[90%] animate-[spin_60s_linear_infinite] text-primary/40 dark:text-primary/30"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {dots}
                  </svg>
                </div>

                {/* Exercise Image */}
                <div className="relative z-10 flex flex-col items-center justify-center w-[70%] h-[70%]">
                  <img
                    src={currentExercise.image}
                    alt={currentExercise.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Exercise Info */}
              <div className="w-full flex items-start justify-between gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {ZONE_LABELS[currentExercise.zone]}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {currentExercise.name}
                  </h2>
                  <p className="text-xs text-neutral-subtle dark:text-gray-400 mt-0.5 line-clamp-1">
                    {currentExercise.objective}
                  </p>
                </div>
                <div className="flex items-center justify-center bg-primary/10 dark:bg-primary/20 text-primary font-bold px-3 py-1.5 rounded-lg border border-primary/10 flex-shrink-0">
                  <span className="material-icons-round text-sm mr-1">timer</span>
                  <span className="text-sm">{currentExercise.durationSeconds}s</span>
                </div>
              </div>

              {/* Movement description */}
              <div className="w-full p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300 text-center line-clamp-2">
                  {currentExercise.movement}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStart}
                className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold py-3.5 px-6 rounded-xl shadow-soft shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span className="text-base">Iniciar</span>
                <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-neutral-subtle dark:text-gray-400 font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm"
              >
                Omitir
              </button>
            </div>
          </>
        ) : (
          // ===== WAITING VIEW =====
          <div className="flex flex-col items-center gap-6">
            {/* Next session info */}
            <div className="bg-white dark:bg-[#2a1b30] rounded-2xl p-6 shadow-card border border-gray-100 dark:border-white/5 w-full text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-icons-round text-primary text-4xl">schedule</span>
              </div>

              {/* Next session time */}
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Próxima pausa activa
              </p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {nextSession?.label || '--:--'}
              </h2>

              {/* Time until */}
              {timeUntil && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  en {formatTimeUntil(timeUntil)}
                </p>
              )}

              {/* Progress indicator */}
              <div className="mt-6 flex items-center justify-center gap-1.5">
                {scheduledSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      completedToday.includes(session.id)
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                {completedCount} de {totalSessions} pausas completadas hoy
              </p>
            </div>

            {/* Notification Status */}
            <div className="w-full">
              {preferences.notifications ? (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                  <span className="material-icons-round text-green-500">notifications_active</span>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Te avisaremos a las {nextSession?.label}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-left"
                >
                  <span className="material-icons-round text-amber-500 flex-shrink-0">notifications_off</span>
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Notificaciones desactivadas
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Actívalas o recuerda ingresar a las {nextSession?.label}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Motivational message */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-4">
              Mantén tu cuerpo activo durante la jornada laboral con micro-pausas de ejercicio
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeScreen;
