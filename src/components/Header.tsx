import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Welcome back, Demo User' },
  '/medicine-price-finder': { title: 'Medicine Prices', subtitle: 'Compare prices near you' },
  '/healthcare-finder': { title: 'Find Healthcare', subtitle: 'Affordable providers near you' },
  '/mental-wellness': { title: 'Mental Wellness AI', subtitle: 'Your wellness journey' },
  '/appointments': { title: 'Appointments', subtitle: 'Manage your schedule' },
  '/settings': { title: 'Settings', subtitle: 'Account & preferences' },
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const location = useLocation();
  const page = pageTitles[location.pathname] ?? { title: 'HealthBridge AI', subtitle: '' };
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.full_name ?? 'G').charAt(0).toUpperCase();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  // Route a free-text search to the most relevant page
  const runSearch = () => {
    const q = search.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    let to = `/medicine-price-finder?q=${encodeURIComponent(q)}`;
    if (/clinic|doctor|dental|dentist|provider|urgent|hospital|care/.test(lower)) to = '/healthcare-finder';
    else if (/mood|anxi|stress|mental|journal|breath|sleep|wellness|therap/.test(lower)) to = '/mental-wellness';
    else if (/appoint|schedule|booking/.test(lower)) to = '/appointments';
    else if (/setting|profile|privacy|notif/.test(lower)) to = '/settings';
    navigate(to);
    setSearch('');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors lg:hidden flex-shrink-0"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          {isSidebarOpen ? (
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Page title */}
      <div className="flex flex-col min-w-0">
        <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{page.title}</p>
        <p className="text-[11px] text-gray-400 leading-tight hidden sm:block">{page.subtitle}</p>
      </div>

      {/* Search bar — hidden on small screens */}
      <div className="hidden md:flex flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
            placeholder="Search medicines, clinics, wellness..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-white transition-all"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Demo badge */}
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
          Demo Mode
        </span>

        {/* Notifications */}
        <div className="relative">
        <button onClick={() => setNotifOpen(o => !o)} aria-expanded={notifOpen} className="relative p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors" aria-label="Notifications (Demo)">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-card-hover z-30 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Notifications</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">DEMO</span>
            </div>
            {[
              { t: 'Appointment reminder', d: 'General Checkup on Jan 15, 2027 (demo)', to: '/appointments' },
              { t: 'Wellness check-in', d: 'Log today\'s mood in your journal', to: '/mental-wellness' },
              { t: 'Price comparison ready', d: 'Compare demo pharmacy prices', to: '/medicine-price-finder' },
            ].map(n => (
              <button key={n.t} onClick={() => { setNotifOpen(false); navigate(n.to); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                <p className="text-xs font-semibold text-gray-800">{n.t}</p>
                <p className="text-[11px] text-gray-500">{n.d}</p>
              </button>
            ))}
          </div>
        )}
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
              {initial}
            </div>
            <span className="hidden lg:block text-xs font-semibold text-gray-700">{user?.full_name}</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-xs font-semibold text-gray-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link to="/login" className="text-xs font-semibold text-gray-700 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors">
              Sign up
            </Link>
          </div>
        )}      </div>
    </header>
  );
};

export default Header;
