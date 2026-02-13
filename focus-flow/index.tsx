import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { initializeNotifications } from './utils/notifications';

// Initialize native features
const initializeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Initialize notifications
    await initializeNotifications();

    // Configure status bar
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#7C3AED' });
    } catch (e) {
      // Status bar might not be available
    }

    // Hide splash screen
    await SplashScreen.hide();
  }
};

initializeApp();

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
