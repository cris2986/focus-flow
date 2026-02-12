import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { ThemeProvider } from './context/ThemeContext';
import HomeScreen from './components/HomeScreen';
import ActiveSessionScreen from './components/ActiveSessionScreen';
import SummaryScreen from './components/SummaryScreen';
import SettingsScreen from './components/SettingsScreen';
import AboutScreen from './components/AboutScreen';
import ScheduleConfigScreen from './components/ScheduleConfigScreen';
import NotificationScheduleScreen from './components/NotificationScheduleScreen';
import CustomExercisesScreen from './components/CustomExercisesScreen';
import OnboardingScreen, { hasCompletedOnboarding } from './components/OnboardingScreen';
import OfflineIndicator from './components/OfflineIndicator';

// Redirect to onboarding if not completed
const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!hasCompletedOnboarding()) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

// Simple Tab Bar Component used in layouts
const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-[#25152b] border-t border-gray-100 dark:border-gray-800 px-6 py-3 safe-area-bottom">
      <ul className="flex justify-between items-center">
        <li>
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <span className="material-icons-round text-2xl">timer</span>
            <span className="text-[10px] font-medium mt-1">Inicio</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate('/summary')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors ${isActive('/summary') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <span className="material-icons-round text-2xl">bar_chart</span>
            <span className="text-[10px] font-medium mt-1">Resumen</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition-colors ${isActive('/settings') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <span className="material-icons-round text-2xl">settings</span>
            <span className="text-[10px] font-medium mt-1">Ajustes</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

const LayoutWithTabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl relative">
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {children}
      </div>
      <TabBar />
    </div>
  );
};

const LayoutFullScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl relative">
      <div className="flex-1 relative flex flex-col">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <OfflineIndicator />
        <HashRouter>
          <Routes>
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/" element={<OnboardingGuard><LayoutWithTabs><HomeScreen /></LayoutWithTabs></OnboardingGuard>} />
            <Route path="/session" element={<OnboardingGuard><LayoutFullScreen><ActiveSessionScreen /></LayoutFullScreen></OnboardingGuard>} />
            <Route path="/summary" element={<OnboardingGuard><LayoutWithTabs><SummaryScreen /></LayoutWithTabs></OnboardingGuard>} />
            <Route path="/settings" element={<OnboardingGuard><LayoutFullScreen><SettingsScreen /></LayoutFullScreen></OnboardingGuard>} />
            <Route path="/settings/schedule" element={<OnboardingGuard><LayoutFullScreen><ScheduleConfigScreen /></LayoutFullScreen></OnboardingGuard>} />
            <Route path="/settings/notifications" element={<OnboardingGuard><LayoutFullScreen><NotificationScheduleScreen /></LayoutFullScreen></OnboardingGuard>} />
            <Route path="/settings/exercises" element={<OnboardingGuard><LayoutFullScreen><CustomExercisesScreen /></LayoutFullScreen></OnboardingGuard>} />
            <Route path="/about" element={<OnboardingGuard><LayoutFullScreen><AboutScreen /></LayoutFullScreen></OnboardingGuard>} />
          </Routes>
        </HashRouter>
      </PreferencesProvider>
    </ThemeProvider>
  );
};

export default App;