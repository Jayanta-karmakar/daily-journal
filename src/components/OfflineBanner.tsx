import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineBanner = () => {
  const { isOnline, isSyncing } = useAppContext();

  if (isOnline && !isSyncing) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full flex items-center justify-center p-2 text-sm font-medium text-white shadow-md transition-all duration-300"
      style={{ 
        zIndex: 99999, 
        backgroundColor: isOnline && isSyncing ? '#3b82f6' : '#f97316' 
      }}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 mr-2" />
          You are offline. Changes are saved locally.
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Syncing changes...
        </>
      ) : null}
    </div>
  );
};

export default OfflineBanner;
