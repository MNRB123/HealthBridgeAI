import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface DisplaySettings {
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

const DEFAULTS: DisplaySettings = {
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
};

interface SettingsState {
  display: DisplaySettings;
  setDisplay: React.Dispatch<React.SetStateAction<DisplaySettings>>;
}

const SettingsContext = createContext<SettingsState | null>(null);

/** Holds display preferences and applies them to <html> so every page reflects them. */
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [display, setDisplay] = useLocalStorage<DisplaySettings>('hb_display', DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('hb-compact', display.compactMode);
    root.classList.toggle('hb-contrast', display.highContrast);
    root.classList.toggle('hb-reduce-motion', display.reducedMotion);
    root.classList.remove('hb-font-small', 'hb-font-large');
    if (display.fontSize !== 'medium') root.classList.add(`hb-font-${display.fontSize}`);
  }, [display]);

  return <SettingsContext.Provider value={{ display, setDisplay }}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
