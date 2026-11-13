import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';

// ─── Icons ────────────────────────────────────────────────────────────────────

const PillIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01" />
  </svg>
);

// ─── Health Score Ring ─────────────────────────────────────────────────────────

const HealthScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} strokeWidth="8" stroke="#e2e8f0" fill="none" />
          <circle
            cx="44" cy="44" r={radius}
            strokeWidth="8"
            stroke="url(#scoreGrad)"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Score</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-700 mt-1">Health Score</p>
      <p className="text-[10px] text-gray-400">Demo — Very Good</p>
    </div>
  );
};

// ─── Mini Stat Pill ────────────────────────────────────────────────────────────

interface MiniStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value, icon, color, bg }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl ${bg} border border-black/5`}>
    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-gray-500 leading-none mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// ─── Activity Item ─────────────────────────────────────────────────────────────

interface ActivityItemProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  time: string;
  badge?: string;
  badgeColor?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, iconColor, iconBg, title, time, badge, badgeColor }) => (
  <div className="flex items-center gap-3 py-2.5 group">
    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
      <p className="text-[11px] text-gray-400">{time}</p>
    </div>
    {badge && (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
        {badge}
      </span>
    )}
  </div>
);

// ─── Quick Action Button ───────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  color: string;
  bg: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, to, color, bg }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${bg} border border-black/5 hover:scale-105 transition-all duration-150 group`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{label}</span>
    </button>
  );
};

// ─── Dashboard Page ────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = isLoggedIn ? (user?.full_name ?? '').split(' ')[0] : 'there';

  const cards = [
    {
      id: 'medicine',
      title: 'Medicine Savings',
      stat: '$142',
      statSub: 'saved',
      description: '3 price comparisons this month across local pharmacies.',
      icon: <PillIcon />,
      accentColor: 'blue' as const,
      buttonLabel: 'Find Prices',
      buttonTo: '/medicine-price-finder',
      trend: { value: '+18% this month', positive: true },
      sparkline: [2, 3, 2, 3, 4, 3, 5],
    },
    {
      id: 'healthcare',
      title: 'Nearby Clinics',
      stat: '12',
      statSub: 'clinics',
      description: 'Affordable providers accepting new patients in your area.',
      icon: <MapPinIcon />,
      accentColor: 'green' as const,
      buttonLabel: 'Find Care',
      buttonTo: '/healthcare-finder',
      trend: { value: '4 new this week', positive: true },
      sparkline: [3, 2, 4, 3, 4, 5, 4],
    },
    {
      id: 'wellness',
      title: 'Wellness Streak',
      stat: '5',
      statSub: 'days',
      description: 'Last check-in was 2 days ago. Keep your streak going!',
      icon: <HeartIcon />,
      accentColor: 'purple' as const,
      buttonLabel: 'Start Session',
      buttonTo: '/mental-wellness',
      trend: { value: 'Personal best!', positive: true },
      sparkline: [1, 3, 2, 4, 3, 4, 5],
    },
    {
      id: 'appointments',
      title: 'Appointments',
      stat: '2',
      statSub: 'upcoming',
      description: 'Next: Jan 15, 2027 — General Checkup (Demo).',
      icon: <CalendarIcon />,
      accentColor: 'amber' as const,
      buttonLabel: 'View Calendar',
      buttonTo: '/appointments',
      trend: { value: '1 this week', positive: true },
      sparkline: [2, 1, 3, 2, 3, 2, 4],
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 p-6 md:p-8">
        {/* Pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-100 pointer-events-none" />
        {/* Blobs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-4 -bottom-12 w-40 h-40 rounded-full bg-accent-500/20 pointer-events-none" />
        <div className="absolute left-1/2 -top-8 w-32 h-32 rounded-full bg-primary-500/20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/90 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
                ⚕ Demo Application
              </span>
              <span className="text-[11px] text-white/50">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {greeting}, {firstName} 👋
            </h2>
            <p className="text-sm text-white/70 max-w-lg leading-relaxed">
              Your health accessibility hub. Compare medicine prices, find affordable care, and
              support your mental wellness — all in one place.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => navigate('/medicine-price-finder')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-primary-700 font-semibold text-sm rounded-xl hover:bg-primary-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                Find Medicine Prices
              </button>
              <button
                onClick={() => navigate('/healthcare-finder')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white font-semibold text-sm rounded-xl hover:bg-white/25 transition-colors border border-white/20 backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                Find Healthcare
              </button>
            </div>
          </div>

          {/* Health Score */}
          <div className="hidden md:flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-4 flex-shrink-0">
            <HealthScoreRing score={78} />
            <div className="mt-3 grid grid-cols-2 gap-2 w-full">
              {[
                { label: 'Savings', val: '$142', color: 'text-blue-300' },
                { label: 'Streak', val: '5d', color: 'text-purple-300' },
                { label: 'Clinics', val: '12', color: 'text-green-300' },
                { label: 'Appts', val: '2', color: 'text-amber-300' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Metrics Bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat
          label="Total Savings (Demo)"
          value="$142 saved"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round"/></svg>}
          color="bg-primary-100 text-primary-600"
          bg="bg-white"
        />
        <MiniStat
          label="Clinics Found (Demo)"
          value="12 nearby"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
          color="bg-success-100 text-success-600"
          bg="bg-white"
        />
        <MiniStat
          label="Wellness Streak (Demo)"
          value="5-day streak"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          color="bg-accent-100 text-accent-600"
          bg="bg-white"
        />
        <MiniStat
          label="Upcoming (Demo)"
          value="2 appointments"
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          color="bg-warning-100 text-warning-600"
          bg="bg-white"
        />
      </div>

      {/* ── Feature Cards ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Your Health Tools</h3>
            <p className="text-xs text-gray-500">Tap a card to explore each feature</p>
          </div>
          <span className="hidden sm:block text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            All Demo Data
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <DashboardCard key={card.id} {...card} />
          ))}
        </div>
      </div>

      {/* ── Bottom Grid: Activity + Quick Actions ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Recent Activity</h4>
              <p className="text-[11px] text-gray-400">Your latest health interactions (Demo)</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            <ActivityItem
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/></svg>}
              iconColor="text-primary-600"
              iconBg="bg-primary-50"
              title="Compared prices for Lisinopril 10mg (Demo)"
              time="2 hours ago"
              badge="Saved $38"
              badgeColor="bg-green-50 text-green-600 border-green-200"
            />
            <ActivityItem
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
              iconColor="text-success-600"
              iconBg="bg-success-50"
              title="Found 3 community health centers nearby (Demo)"
              time="Yesterday"
              badge="New results"
              badgeColor="bg-blue-50 text-blue-600 border-blue-200"
            />
            <ActivityItem
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
              iconColor="text-accent-600"
              iconBg="bg-accent-50"
              title="Completed daily wellness check-in (Demo)"
              time="2 days ago"
              badge="🔥 Streak"
              badgeColor="bg-orange-50 text-orange-600 border-orange-200"
            />
            <ActivityItem
              icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              iconColor="text-warning-600"
              iconBg="bg-warning-50"
              title="Appointment reminder: Jan 15 checkup (Demo)"
              time="3 days ago"
              badge="Upcoming"
              badgeColor="bg-amber-50 text-amber-600 border-amber-200"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-1">Quick Actions</h4>
            <p className="text-[11px] text-gray-400 mb-4">Jump to a feature</p>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>}
                label="Search Meds"
                to="/medicine-price-finder"
                color="bg-primary-100 text-primary-600"
                bg="bg-primary-50"
              />
              <QuickAction
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
                label="Find Clinic"
                to="/healthcare-finder"
                color="bg-success-100 text-success-600"
                bg="bg-success-50"
              />
              <QuickAction
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                label="Wellness"
                to="/mental-wellness"
                color="bg-accent-100 text-accent-600"
                bg="bg-accent-50"
              />
              <QuickAction
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                label="Schedule"
                to="/appointments"
                color="bg-warning-100 text-warning-600"
                bg="bg-warning-50"
              />
            </div>
          </div>

          {/* Upcoming appointment card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Next Appointment</span>
              </div>
              <p className="text-base font-bold text-white mb-0.5">General Checkup</p>
              <p className="text-[13px] text-white/70 mb-3">Jan 15, 2027 · 10:00 AM (Demo)</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/20">
                  Demo Provider
                </span>
                <span className="text-[10px] text-white/50">•</span>
                <span className="text-[10px] text-white/50">In-person</span>
              </div>
              <button
                onClick={() => navigate('/appointments')}
                className="mt-3 w-full py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/20 transition-colors"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Demo Notice (dismissible) ─────────────────────────────────────────── */}
      {!dismissed && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-slide-up">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Demo Application</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              HealthBridge AI shows only demonstration data. No real providers, prices, or medical
              information is displayed. Do not make medical decisions based on this app.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 transition-colors p-1 flex-shrink-0"
            aria-label="Dismiss notice"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
