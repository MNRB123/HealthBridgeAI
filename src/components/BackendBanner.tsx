/**
 * Shows a banner at the top of the page when the FastAPI backend is offline.
 * Disappears automatically when the backend comes online.
 */
import React from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';

const BackendBanner: React.FC = () => {
  const { online } = useBackendStatus();

  // Dev-only: hidden in production builds so the deployed demo stays clean.
  // null = still checking, true = online (hide banner), false = offline
  if (!import.meta.env.DEV || online !== false) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500 text-white text-xs font-semibold">
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
      </svg>
      <span>
        Backend offline — running in demo mode.
        Start the API with: <code className="bg-amber-600 px-1.5 py-0.5 rounded font-mono">docker compose up --build</code>
      </span>
    </div>
  );
};

export default BackendBanner;
