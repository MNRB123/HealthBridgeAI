/**
 * Polls the backend /health endpoint every 30s.
 * Returns { online: boolean } so the UI can show a banner when offline.
 */
import { useState, useEffect } from 'react';
import { healthCheck } from '../api/client';

export function useBackendStatus() {
  const [online, setOnline] = useState<boolean | null>(null); // null = checking

  const check = async () => {
    const res = await healthCheck();
    setOnline(res?.status === 'ok');
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { online };
}
