import { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Show "back online" briefly
      setTimeout(() => setShowBanner(false), 2000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-medium transition-all duration-300 ${
        isOffline
          ? 'bg-amber-500 text-white'
          : 'bg-green-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <span className="material-icons-round text-sm">
          {isOffline ? 'cloud_off' : 'cloud_done'}
        </span>
        <span>
          {isOffline
            ? 'Sin conexión - La app funciona offline'
            : 'Conexión restaurada'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
