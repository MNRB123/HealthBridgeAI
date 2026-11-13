import React, { useState } from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

// ─── Toggle component ─────────────────────────────────────────────────────────

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({ value, onChange, label, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary-600' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    style={{ height: 22, width: 40 }}
    role="switch"
    aria-label={label}
    aria-checked={value}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
  </button>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { online } = useBackendStatus();

  // Profile (demo values)
  const { user } = useAuth();
  const [name, setName] = useLocalStorage('hb_profile_name', user?.full_name ?? 'Demo User');
  const [email, setEmail] = useLocalStorage('hb_profile_email', user?.email ?? 'demo@healthbridge.ai');
  const [zip, setZip] = useLocalStorage('hb_profile_zip', '10001');
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useLocalStorage('hb_notifs', {
    appointmentReminders: true,
    medicineAlerts: false,
    wellnessReminders: true,
    weeklyReport: true,
    emailNotifs: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useLocalStorage('hb_privacy', {
    saveJournalLocal: true,
    shareAnonymousData: false,
    allowCrisisAlerts: true,
  });

  // Display (applied app-wide through SettingsContext)
  const { display, setDisplay } = useSettings();

  const [activeSection] = useState<string | null>(null);

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const NavItem: React.FC<{ id: string; icon: string; label: string }> = ({ id, icon, label }) => (
    <button
      onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeSection === id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
    >
      <span>{icon}</span>{label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account, preferences, and application settings</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          Demo — Saved in this browser only
        </span>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
        <NavItem id="profile" icon="👤" label="Profile" />
        <NavItem id="notifications" icon="🔔" label="Notifications" />
        <NavItem id="privacy" icon="🔒" label="Privacy" />
        <NavItem id="display" icon="🎨" label="Display" />
        <NavItem id="backend" icon="⚙️" label="Backend" />
        <NavItem id="about" icon="ℹ️" label="About" />
      </div>

      {/* Profile */}
      <div id="profile">
        <Section title="👤 Your Profile" subtitle="Demo account information — changes are not saved to a real database">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              D
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full">Free Plan · Demo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">ZIP Code</label>
              <input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 10001"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
            </div>
            <div className="flex items-end">
              <button onClick={handleProfileSave}
                className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition-colors ${profileSaved ? 'bg-success-500 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
                {profileSaved ? (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg>Saved!</>
                ) : (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>Save Changes (Demo)</>
                )}
              </button>
            </div>
          </div>
        </Section>
      </div>

      {/* Notifications */}
      <div id="notifications">
        <Section title="🔔 Notifications" subtitle="Control when and how HealthBridge AI notifies you (demo — not functional)">
          <div className="space-y-4">
            {([
              { key: 'appointmentReminders', label: 'Appointment Reminders', desc: '24-hour and 1-hour reminders before appointments' },
              { key: 'medicineAlerts', label: 'Medicine Price Alerts', desc: 'Get notified when prices drop for your saved medications' },
              { key: 'wellnessReminders', label: 'Daily Wellness Check-ins', desc: 'Gentle reminder to complete your daily mood journal' },
              { key: 'weeklyReport', label: 'Weekly Health Summary', desc: 'Weekly overview of your wellness trends and savings' },
              { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive notifications via email instead of / in addition to in-app' },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle label={item.label} value={notifs[item.key]} onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Privacy */}
      <div id="privacy">
        <Section title="🔒 Privacy & Data" subtitle="Control how your health data is handled">
          <div className="space-y-4">
            {([
              { key: 'saveJournalLocal', label: 'Save Journal Locally', desc: 'Store mood journal entries in your browser. Disable to clear on close.' },
              { key: 'allowCrisisAlerts', label: 'Enable Crisis Safety Checks', desc: 'Automatically display 988 resources if crisis language is detected in chat.' },
              { key: 'shareAnonymousData', label: 'Share Anonymous Usage Data', desc: 'Help improve HealthBridge AI with anonymized, non-identifiable usage statistics.' },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle label={item.label} value={privacy[item.key]} onChange={v => setPrivacy(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (!window.confirm('Delete all saved demo data (journal, appointments, settings) and log out?')) return;
                Object.keys(localStorage).filter(k => k.startsWith('hb_')).forEach(k => localStorage.removeItem(k));
                window.location.assign('/');
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
              Delete all saved demo data from this browser
            </button>
          </div>
        </Section>
      </div>

      {/* Display */}
      <div id="display">
        <Section title="🎨 Display & Accessibility" subtitle="Customize the look and feel of the app">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Compact Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Reduce spacing and padding for more content on screen</p>
              </div>
              <Toggle label="Compact Mode" value={display.compactMode} onChange={v => setDisplay(p => ({ ...p, compactMode: v }))} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">High Contrast Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Increase contrast for better readability</p>
              </div>
              <Toggle label="High Contrast Mode" value={display.highContrast} onChange={v => setDisplay(p => ({ ...p, highContrast: v }))} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Reduce Motion</p>
                <p className="text-xs text-gray-400 mt-0.5">Minimize animations for accessibility or performance</p>
              </div>
              <Toggle label="Reduce Motion" value={display.reducedMotion} onChange={v => setDisplay(p => ({ ...p, reducedMotion: v }))} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Font Size</p>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button key={size} onClick={() => setDisplay(p => ({ ...p, fontSize: size }))}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all capitalize ${display.fontSize === size ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Backend status */}
      <div id="backend">
        <Section title="⚙️ Backend & API" subtitle="Connection status and configuration">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${online === true ? 'bg-success-500' : online === false ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">FastAPI Backend</p>
                  <p className="text-xs text-gray-400">http://localhost:8000</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${online === true ? 'bg-success-50 text-success-700 border-success-200' : online === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {online === true ? '✓ Online' : online === false ? '✗ Offline' : 'Checking…'}
              </span>
            </div>

            {online === false && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-800 mb-1">Start the backend</p>
                <code className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-1 rounded block">
                  cd d:\HealthBridgeAI && docker compose up --build
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Database', value: 'SQLite (demo)' },
                { label: 'Auth', value: 'JWT (HS256)' },
                { label: 'AI Model', value: 'GPT-4o' },
                { label: 'API Docs', value: '/docs' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-semibold text-gray-700">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* About */}
      <div id="about">
        <Section title="ℹ️ About HealthBridge AI">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.5}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">HealthBridge AI</p>
              <p className="text-xs text-gray-500 mt-0.5">Version 1.0.0 · Demo Build</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-lg">
                A demonstration healthcare accessibility application helping people in the United States
                find affordable healthcare, compare medicine prices, and access mental wellness support.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            {[
              { label: 'Stack', value: 'React + FastAPI' },
              { label: 'Language', value: 'TypeScript + Python' },
              { label: 'Database', value: 'SQLite / PostgreSQL' },
              { label: 'License', value: 'Demo Only' },
            ].map(s => (
              <div key={s.label} className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-700">{s.value}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-[11px] font-bold text-amber-800">⚠ Disclaimer</p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              HealthBridge AI is a demonstration application. All data shown is fictional and for
              demonstration purposes only. This application is not intended for actual medical,
              pharmaceutical, or mental health use. Always consult licensed healthcare professionals.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Settings;
