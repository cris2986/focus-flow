import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full items-center justify-between bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="w-full px-4 h-14 flex items-center justify-between z-10 safe-area-top pt-4">
        <button 
            onClick={() => navigate('/settings')}
            className="flex items-center text-primary dark:text-primary hover:opacity-80 transition-opacity"
        >
          <span className="material-icons-round text-3xl">chevron_left</span>
          <span className="text-lg font-medium ml-[-4px]">Atrás</span>
        </button>
        <div className="w-16"></div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-md px-6 flex flex-col items-center justify-center -mt-10">
        <div className="mb-8 relative group">
          <div className="w-24 h-24 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10"></div>
            <span className="material-icons-round text-primary text-5xl drop-shadow-sm">all_inclusive</span>
          </div>
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50 -z-10"></div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Focus Flow</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-10 tracking-widest uppercase">Versión 1.0.0</p>

        <div className="text-center space-y-4 max-w-xs mx-auto">
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Sistema offline y determinista de interrupciones fisiológicas.
          </p>
        </div>

        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full my-8"></div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-primary text-sm">lock</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5">Privacidad</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Los datos se guardan localmente.</span>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center pb-8 safe-area-bottom">
        <p className="text-[10px] text-slate-400 dark:text-slate-600">© 2026 Focus Flow Inc.</p>
      </footer>
    </div>
  );
};

export default AboutScreen;