import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Exercise } from '../types';
import { exercises, ZONE_LABELS } from '../data/exercises';
import { markSessionCompleted, getCurrentSessionId } from '../utils/sessions';
import { recordCompletedExercise } from '../utils/stats';
import { playCompletionSound } from '../utils/sound';
import { usePreferences } from '../context/PreferencesContext';

const ActiveSessionScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = usePreferences();

  const exercise: Exercise = location.state?.exercise ?? exercises[0];

  const [timeLeft, setTimeLeft] = useState(exercise.durationSeconds);
  const totalTime = exercise.durationSeconds;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const completeSession = () => {
    const sessionId = getCurrentSessionId();
    if (sessionId) {
      markSessionCompleted(sessionId);
    }
    // Record exercise for stats
    recordCompletedExercise({
      id: exercise.id,
      name: exercise.name,
      zone: exercise.zone,
      durationSeconds: exercise.durationSeconds,
    });
    // Play completion sound if enabled
    if (preferences.sound) {
      playCompletionSound();
    }
    navigate('/summary', { state: { exercise, completed: true } });
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      completeSession();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate, exercise]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <main className="flex flex-col h-full w-full px-4 py-4 relative overflow-hidden">
      {/* Header with exercise info */}
      <div className="w-full flex-shrink-0 animate-fade-in">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {ZONE_LABELS[exercise.zone]}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="material-icons-round text-xs">
              {exercise.posture === 'sitting' ? 'chair' : 'accessibility_new'}
            </span>
            {exercise.posture === 'sitting' ? 'Sentado' : 'De pie'}
          </span>
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white text-center">
          {exercise.name}
        </h2>
      </div>

      {/* Illustration Area - Flexible */}
      <div className="flex-1 flex flex-col justify-center items-center w-full min-h-0 py-4">
        <div className="w-full max-w-[180px] aspect-square relative flex items-center justify-center">
          {/* Background blurs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl transform translate-x-2 -translate-y-2"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-400/10 rounded-full blur-2xl transform -translate-x-2 translate-y-2"></div>

          {/* Exercise Image */}
          <div className="relative z-10 flex items-center justify-center w-[65%] h-[65%]">
            <img
              src={exercise.image}
              alt={exercise.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-1000"
            />
          </svg>
        </div>

        {/* Movement instruction */}
        <div className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-lg mt-3 max-w-[280px]">
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
            {exercise.movement}
          </p>
        </div>
      </div>

      {/* Timer Area */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 mb-4">
        <h1 className="text-6xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white mb-2">
          {formatTime(timeLeft)}
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-neutral-subtle dark:text-gray-300 uppercase tracking-wide">
                En progreso
            </span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex-shrink-0 flex flex-col gap-2 pb-2">
        <button
            type="button"
            onClick={completeSession}
            className="w-full group relative flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all duration-200 text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-primary/20"
        >
          <span>Finalizar</span>
          <span className="material-icons text-white/80 text-lg group-hover:translate-x-1 transition-transform">check</span>
        </button>
        <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-neutral-subtle/60 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </main>
  );
};

export default ActiveSessionScreen;
