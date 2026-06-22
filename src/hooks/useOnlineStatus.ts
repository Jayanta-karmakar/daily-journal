import { useState, useEffect, useCallback } from 'react';
import { CONNECTIVITY } from '@/config/constants';

async function checkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch(CONNECTIVITY.CHECK_URL, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(CONNECTIVITY.CHECK_TIMEOUT_MS),
    });
    // 'no-cors' returns opaque response (type=opaque, status=0) — that alone means internet is reachable
    return true;
  } catch {
    return false;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const updateOnlineStatus = useCallback(async () => {
    const online = await checkConnectivity();
    setIsOnline(online);
  }, []);

  useEffect(() => {
    // Run initial check
    updateOnlineStatus();

    // Re-run whenever the browser fires online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Also poll every N seconds to catch cases where events don't fire
    const interval = setInterval(updateOnlineStatus, CONNECTIVITY.CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [updateOnlineStatus]);

  return isOnline;
}
