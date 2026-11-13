import React, { useState } from 'react';
import Modal from '../components/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderType = 'community' | 'clinic' | 'hospital' | 'dental' | 'mental' | 'urgent';
type BudgetOption = 'free' | 'sliding' | 'under25' | 'under50' | 'any';
type AcceptsInsurance = 'any' | 'medicaid' | 'medicare' | 'uninsured';

interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  address: string;
  distance: string;
  phone: string;
  hours: string;
  acceptingNew: boolean;
  languages: string[];
  budget: BudgetOption;
  insurance: AcceptsInsurance[];
  rating: number;
  reviews: number;
  specialties: string[];
  waitTime: string;
  telehealth: boolean;
  verified: boolean;
  lat: number;
  lng: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PROVIDERS: Provider[] = [
  {
    id: '1', name: 'Riverside Community Health Center', type: 'community',
    address: '245 Main St, Demo City, NY 10001', distance: '0.4 mi', phone: '(555) 100-0001',
    hours: 'Mon–Fri 8am–6pm, Sat 9am–1pm', acceptingNew: true,
    languages: ['English', 'Spanish', 'Mandarin'], budget: 'sliding',
    insurance: ['medicaid', 'medicare', 'uninsured'], rating: 4.6, reviews: 128,
    specialties: ['Primary Care', 'Pediatrics', 'OB/GYN', 'Dental'],
    waitTime: '< 1 week', telehealth: true, verified: true, lat: 40.7128, lng: -74.0060,
  },
  {
    id: '2', name: 'Hope Free Clinic', type: 'clinic',
    address: '88 Oak Ave, Demo City, NY 10002', distance: '0.9 mi', phone: '(555) 100-0002',
    hours: 'Tue & Thu 5pm–9pm, Sat 10am–2pm', acceptingNew: true,
    languages: ['English', 'Spanish'], budget: 'free',
    insurance: ['uninsured'], rating: 4.9, reviews: 214,
    specialties: ['Primary Care', 'Chronic Disease Management', 'Mental Health'],
    waitTime: '1–2 weeks', telehealth: false, verified: true, lat: 40.7138, lng: -74.0070,
  },
  {
    id: '3', name: 'Metro Urgent Care Center', type: 'urgent',
    address: '500 Broadway, Demo City, NY 10003', distance: '1.2 mi', phone: '(555) 100-0003',
    hours: 'Daily 8am–10pm', acceptingNew: true,
    languages: ['English', 'Spanish', 'French'], budget: 'under50',
    insurance: ['medicaid', 'medicare', 'any'], rating: 4.1, reviews: 342,
    specialties: ['Urgent Care', 'X-Ray', 'Lab Work', 'Minor Surgery'],
    waitTime: 'Walk-in', telehealth: true, verified: true, lat: 40.7148, lng: -74.0050,
  },
  {
    id: '4', name: 'Sunrise Dental Access Clinic', type: 'dental',
    address: '17 Park Blvd, Demo City, NY 10004', distance: '1.5 mi', phone: '(555) 100-0004',
    hours: 'Mon–Thu 9am–5pm', acceptingNew: false,
    languages: ['English'], budget: 'sliding',
    insurance: ['medicaid', 'uninsured'], rating: 4.3, reviews: 87,
    specialties: ['Cleanings', 'Extractions', 'Fillings', 'Emergency Dental'],
    waitTime: '2–3 weeks', telehealth: false, verified: true, lat: 40.7118, lng: -74.0080,
  },
  {
    id: '5', name: 'Wellspring Mental Health Center', type: 'mental',
    address: '300 Elm St, Suite 4, Demo City, NY 10005', distance: '2.0 mi', phone: '(555) 100-0005',
    hours: 'Mon–Fri 9am–7pm', acceptingNew: true,
    languages: ['English', 'Spanish', 'Haitian Creole'], budget: 'sliding',
    insurance: ['medicaid', 'medicare', 'uninsured'], rating: 4.7, reviews: 95,
    specialties: ['Therapy', 'Psychiatry', 'Substance Use', 'Crisis Support'],
    waitTime: '< 2 weeks', telehealth: true, verified: true, lat: 40.7158, lng: -74.0040,
  },
  {
    id: '6', name: 'City General Hospital — Outpatient', type: 'hospital',
    address: '1 Hospital Drive, Demo City, NY 10006', distance: '2.4 mi', phone: '(555) 100-0006',
    hours: 'Mon–Fri 7am–8pm', acceptingNew: true,
    languages: ['English', 'Spanish', 'Arabic', 'Russian'], budget: 'any',
    insurance: ['medicaid', 'medicare', 'any'], rating: 3.9, reviews: 512,
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Pediatrics'],
    waitTime: '2–4 weeks', telehealth: true, verified: true, lat: 40.7108, lng: -74.0090,
  },
  {
    id: '7', name: 'HealthBridge Community Clinic', type: 'community',
    address: '72 Center Ave, Demo City, NY 10007', distance: '3.1 mi', phone: '(555) 100-0007',
    hours: 'Mon–Sat 8am–5pm', acceptingNew: true,
    languages: ['English', 'Spanish', 'Vietnamese'], budget: 'free',
    insurance: ['uninsured', 'medicaid'], rating: 4.5, reviews: 76,
    specialties: ['Primary Care', 'Women\'s Health', 'Immunizations', 'HIV Services'],
    waitTime: '< 1 week', telehealth: false, verified: true, lat: 40.7168, lng: -74.0030,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeIcon: React.FC<{ type: ProviderType }> = ({ type }) => {
  const icons: Record<ProviderType, React.ReactElement> = {
    community: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    clinic: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    hospital: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>,
    dental: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="1.5"/></svg>,
    mental: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    urgent: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  };
  return icons[type];
};

const StarRating: React.FC<{ rating: number; reviews: number }> = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
    <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)} ({reviews})</span>
  </div>
);

const BudgetBadge: React.FC<{ budget: BudgetOption }> = ({ budget }) => {
  const config: Record<BudgetOption, { label: string; color: string }> = {
    free: { label: 'Free', color: 'bg-success-100 text-success-700 border-success-200' },
    sliding: { label: 'Sliding Scale', color: 'bg-primary-100 text-primary-700 border-primary-200' },
    under25: { label: 'Under $25', color: 'bg-accent-100 text-accent-700 border-accent-200' },
    under50: { label: 'Under $50', color: 'bg-warning-100 text-warning-700 border-warning-200' },
    any: { label: 'Insurance', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const { label, color } = config[budget];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>;
};

// ─── Map Placeholder ─────────────────────────────────────────────────────────

const MapPlaceholder: React.FC<{ providers: Provider[]; selected: string | null; onSelect: (id: string) => void }> = ({ providers, selected, onSelect }) => {
  const typeColors: Record<ProviderType, string> = {
    community: 'bg-primary-500', clinic: 'bg-success-500', hospital: 'bg-red-500',
    dental: 'bg-accent-500', mental: 'bg-purple-500', urgent: 'bg-warning-500',
  };

  // Position pins pseudo-randomly but deterministically based on distance
  const positions = [
    { top: '25%', left: '45%' }, { top: '55%', left: '30%' }, { top: '40%', left: '60%' },
    { top: '70%', left: '55%' }, { top: '30%', left: '70%' }, { top: '60%', left: '75%' },
    { top: '45%', left: '20%' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 rounded-xl overflow-hidden border border-gray-200">
      {/* Grid lines (fake map grid) */}
      <div className="absolute inset-0 opacity-20">
        {[20, 40, 60, 80].map(p => (
          <React.Fragment key={p}>
            <div className="absolute left-0 right-0 h-px bg-gray-400" style={{ top: `${p}%` }} />
            <div className="absolute top-0 bottom-0 w-px bg-gray-400" style={{ left: `${p}%` }} />
          </React.Fragment>
        ))}
      </div>

      {/* Roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <line x1="0" y1="150" x2="400" y2="150" stroke="#d1d5db" strokeWidth="6" opacity="0.5"/>
        <line x1="200" y1="0" x2="200" y2="300" stroke="#d1d5db" strokeWidth="6" opacity="0.5"/>
        <line x1="0" y1="80" x2="400" y2="200" stroke="#e5e7eb" strokeWidth="3" opacity="0.4"/>
        <line x1="80" y1="0" x2="320" y2="300" stroke="#e5e7eb" strokeWidth="3" opacity="0.4"/>
      </svg>

      {/* Demo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p className="text-xs font-semibold text-gray-300">Demo Map View</p>
          <p className="text-[10px] text-gray-300">Not a real map</p>
        </div>
      </div>

      {/* Provider pins */}
      {providers.slice(0, 7).map((p, i) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`absolute transform -translate-x-1/2 -translate-y-full group z-10`}
          style={{ top: positions[i]?.top ?? '50%', left: positions[i]?.left ?? '50%' }}
          title={p.name}
        >
          <div className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-md transition-all duration-150 ${typeColors[p.type]} ${selected === p.id ? 'scale-125 ring-2 ring-primary-400' : 'hover:scale-110'}`}>
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="2.5" fill="white" stroke="none"/>
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                {p.name.split(' ').slice(0, 3).join(' ')}
              </div>
            </div>
          </div>
          <div className={`w-1.5 h-1.5 ${typeColors[p.type]} rounded-full mx-auto -mt-0.5 opacity-50`} />
        </button>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Legend</p>
        {(['community', 'clinic', 'hospital', 'dental', 'mental', 'urgent'] as ProviderType[]).map(t => (
          <div key={t} className="flex items-center gap-1.5 mb-0.5">
            <div className={`w-2 h-2 rounded-full ${typeColors[t]}`} />
            <span className="text-[9px] text-gray-600 capitalize">{t === 'mental' ? 'Mental Health' : t === 'urgent' ? 'Urgent Care' : t}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

// ─── Provider Card ────────────────────────────────────────────────────────────

const ProviderCard: React.FC<{ provider: Provider; isSelected: boolean; onClick: () => void }> = ({ provider: p, isSelected, onClick }) => {
  const typeConfig: Record<ProviderType, { label: string; color: string; bg: string }> = {
    community: { label: 'Community Health', color: 'text-primary-700', bg: 'bg-primary-100' },
    clinic: { label: 'Free Clinic', color: 'text-success-700', bg: 'bg-success-100' },
    hospital: { label: 'Hospital', color: 'text-red-700', bg: 'bg-red-100' },
    dental: { label: 'Dental', color: 'text-accent-700', bg: 'bg-accent-100' },
    mental: { label: 'Mental Health', color: 'text-purple-700', bg: 'bg-purple-100' },
    urgent: { label: 'Urgent Care', color: 'text-warning-700', bg: 'bg-warning-100' },
  };
  const tc = typeConfig[p.type];
  const [action, setAction] = useState<'call' | 'directions' | 'virtual' | null>(null);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-card-hover ${isSelected ? 'border-primary-300 shadow-glow-blue ring-1 ring-primary-200' : 'border-gray-100 shadow-card'}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${tc.bg} ${tc.color} flex items-center justify-center`}>
              <TypeIcon type={p.type} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{p.name}</h3>
                {p.verified && (
                  <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"/>
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold ${tc.color}`}>{tc.label}</span>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-500">{p.distance}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <BudgetBadge budget={p.budget} />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.acceptingNew ? 'bg-success-50 text-success-700 border-success-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {p.acceptingNew ? '✓ Accepting New' : '✗ Waitlist'}
            </span>
          </div>
        </div>

        {/* Rating + wait */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={p.rating} reviews={p.reviews} />
          <span className="text-gray-200">|</span>
          <span className="text-[11px] text-gray-500">⏱ Wait: <span className="font-semibold text-gray-700">{p.waitTime}</span></span>
          {p.telehealth && (
            <>
              <span className="text-gray-200">|</span>
              <span className="text-[11px] text-primary-600 font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Telehealth
              </span>
            </>
          )}
        </div>

        {/* Address + hours */}
        <div className="space-y-1 mb-3">
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-xs text-gray-600">{p.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-xs text-gray-600">{p.hours}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {p.specialties.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{s}</span>
          ))}
          {p.specialties.length > 4 && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{p.specialties.length - 4} more</span>
          )}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span className="text-[11px] text-gray-500">{p.languages.join(' · ')}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button onClick={e => { e.stopPropagation(); setAction('call'); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </button>
          <button onClick={e => { e.stopPropagation(); setAction('directions'); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Directions
          </button>
          {p.telehealth && (
            <button onClick={e => { e.stopPropagation(); setAction('virtual'); }} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-accent-50 hover:bg-accent-100 text-accent-700 rounded-xl border border-accent-200 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Virtual
            </button>
          )}
        </div>
      </div>

      {action && (
        <Modal
          title={action === 'call' ? 'Call (demo)' : action === 'directions' ? 'Directions (demo)' : 'Virtual visit (demo)'}
          onClose={() => setAction(null)}
        >
          <p className="text-sm font-semibold text-gray-800">{p.name}</p>
          {action === 'call' && <p className="text-lg font-mono font-bold text-primary-700 mt-2">{p.phone}</p>}
          {action === 'directions' && <p className="text-sm text-gray-600 mt-2">{p.address}</p>}
          {action === 'virtual' && <p className="text-sm text-gray-600 mt-2">Telehealth is offered here. Wait time: {p.waitTime}.</p>}
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
            Fictional provider. The phone number and address are placeholders and do not connect anywhere.
          </p>
        </Modal>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HealthcareFinder: React.FC = () => {
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProviderType | 'all'>('all');
  const [radius, setRadius] = useState(5);
  const [budget, setBudget] = useState<BudgetOption | 'all'>('all');
  const [specialty, setSpecialty] = useState('all');
  const [insurance, setInsurance] = useState<AcceptsInsurance | 'all'>('all');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'budget'>('distance');

  const handleSearch = () => {
    if (zip.length !== 5) { setZipError('Enter a 5-digit ZIP code.'); return; }
    setZipError('');
    setLoading(true);
    setSelectedId(null);
    setTimeout(() => { setLoading(false); setSearched(true); }, 1000);
  };

  const filtered = DEMO_PROVIDERS.filter(p => {
    if (parseFloat(p.distance) > radius) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (budget !== 'all' && p.budget !== budget) return false;
    if (specialty !== 'all' && !p.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))) return false;
    if (insurance !== 'all' && !p.insurance.includes(insurance as AcceptsInsurance)) return false;
    if (acceptingOnly && !p.acceptingNew) return false;
    if (telehealthOnly && !p.telehealth) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'budget') {
      const o: BudgetOption[] = ['free', 'sliding', 'under25', 'under50', 'any'];
      return o.indexOf(a.budget) - o.indexOf(b.budget);
    }
    return parseFloat(a.distance) - parseFloat(b.distance);
  });

  const allSpecialties = Array.from(new Set(DEMO_PROVIDERS.flatMap(p => p.specialties))).sort();

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Healthcare Finder</h1>
          <p className="text-sm text-gray-500 mt-0.5">Find affordable clinics, free care, and specialists near you — <span className="text-success-600 font-medium">demo data only</span></p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/></svg>
          Demo — Not real providers
        </span>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-success-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Search for Providers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* ZIP */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ZIP Code</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <input
                type="text"
                value={zip}
                onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 10001"
                aria-invalid={!!zipError}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition-all"
              />
            </div>
            {zipError && <p role="alert" className="text-xs text-red-600 font-medium mt-1">{zipError}</p>}
          </div>

          {/* Radius slider */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Radius: <span className="text-success-600">{radius} miles</span></label>
            <div className="flex items-center gap-2 h-[42px]">
              <span className="text-xs text-gray-400">1mi</span>
              <input
                type="range" min={1} max={25} step={1} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="flex-1 accent-success-600 h-1.5 rounded-full"
              />
              <span className="text-xs text-gray-400">25mi</span>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget / Cost</label>
            <select
              value={budget}
              onChange={e => setBudget(e.target.value as typeof budget)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-success-300 transition-all"
            >
              <option value="all">Any Cost</option>
              <option value="free">Free / No Cost</option>
              <option value="sliding">Sliding Scale</option>
              <option value="under25">Under $25</option>
              <option value="under50">Under $50</option>
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialty</label>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-success-300 transition-all"
            >
              <option value="all">All Specialties</option>
              {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Second row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          {/* Insurance */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Insurance:</span>
            {(['all', 'medicaid', 'medicare', 'uninsured'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setInsurance(opt)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${insurance === opt ? 'bg-success-600 text-white border-success-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-success-300'}`}
              >
                {opt === 'all' ? 'Any' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 ml-auto">
            {[
              { label: 'Accepting new patients', value: acceptingOnly, set: setAcceptingOnly },
              { label: 'Telehealth available', value: telehealthOnly, set: setTelehealthOnly },
            ].map(t => (
              <label key={t.label} className="flex items-center gap-2 cursor-pointer">
                <button type="button" role="switch" aria-checked={t.value} onClick={() => t.set(p => !p)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${t.value ? 'bg-success-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t.value ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-xs font-medium text-gray-700">{t.label}</span>
              </label>
            ))}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-success-600 hover:bg-success-700 disabled:bg-gray-200 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Searching...</>
              ) : (
                <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>Find Providers</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pre-search: type chips */}
      {!searched && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Browse by Provider Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {([
              { type: 'community', label: 'Community Health', icon: '🏥', color: 'bg-primary-50 border-primary-100 text-primary-700' },
              { type: 'clinic', label: 'Free Clinic', icon: '❤️', color: 'bg-success-50 border-success-100 text-success-700' },
              { type: 'hospital', label: 'Hospital', icon: '🏨', color: 'bg-red-50 border-red-100 text-red-700' },
              { type: 'dental', label: 'Dental', icon: '🦷', color: 'bg-accent-50 border-accent-100 text-accent-700' },
              { type: 'mental', label: 'Mental Health', icon: '🧠', color: 'bg-purple-50 border-purple-100 text-purple-700' },
              { type: 'urgent', label: 'Urgent Care', icon: '⚡', color: 'bg-warning-50 border-warning-100 text-warning-700' },
            ] as const).map(item => (
              <button
                key={item.type}
                onClick={() => { setTypeFilter(item.type); handleSearch(); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${item.color} hover:scale-105 transition-all text-center`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🔍', title: 'Enter Your ZIP Code', desc: 'Start by entering your ZIP to find providers in your area' },
              { icon: '💰', title: 'Filter by Budget', desc: 'Find free clinics, sliding scale, or low-cost options' },
              { icon: '📞', title: 'Call or Get Directions', desc: 'Contact providers directly or get directions in one tap' },
            ].map(s => (
              <div key={s.title} className="flex items-start gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">{s.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-gray-900">{filtered.length} providers found</span>
              <span className="text-sm text-gray-500"> within {radius} miles{zip ? ` of ${zip}` : ''}</span>
              <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">DEMO DATA</span>
              {typeFilter !== 'all' && (
                <button onClick={() => setTypeFilter('all')} className="ml-2 text-[11px] font-semibold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full hover:bg-success-100">
                  Type: {typeFilter} ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-success-300"
              >
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="budget">Lowest Cost</option>
              </select>
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                {(['list', 'map'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {v === 'list' ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    )}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {view === 'list' ? (
            /* List view */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(p => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  isSelected={selectedId === p.id}
                  onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="text-sm font-semibold text-gray-700 mt-3">No providers match your filters</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your budget or specialty filters</p>
                </div>
              )}
            </div>
          ) : (
            /* Map + list split view */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-[500px] lg:h-auto lg:sticky lg:top-20">
                <MapPlaceholder providers={filtered} selected={selectedId} onSelect={id => setSelectedId(id === selectedId ? null : id)} />
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-hide">
                {filtered.map(p => (
                  <ProviderCard key={p.id} provider={p} isSelected={selectedId === p.id} onClick={() => setSelectedId(selectedId === p.id ? null : p.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Resources panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-1">📚 Free Healthcare Resources</h4>
            <p className="text-[11px] text-gray-400 mb-4">National programs for affordable care (general info — verify independently)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: '🏥', title: 'HRSA Health Centers', desc: 'Federally funded community health centers for all income levels', color: 'bg-primary-50 border-primary-100' },
                { icon: '💊', title: 'Medicaid / CHIP', desc: 'Government health coverage for low-income individuals and families', color: 'bg-success-50 border-success-100' },
                { icon: '🤝', title: 'NeedyMeds.org', desc: 'Patient assistance programs and free/low-cost clinics database', color: 'bg-accent-50 border-accent-100' },
                { icon: '📞', title: '211 Helpline', desc: 'Dial 2-1-1 to connect with local health and social services', color: 'bg-warning-50 border-warning-100' },
              ].map(r => (
                <div key={r.title} className={`p-3 rounded-xl border ${r.color}`}>
                  <span className="text-xl">{r.icon}</span>
                  <p className="text-xs font-bold text-gray-800 mt-2">{r.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-xs font-bold text-amber-800 mb-1">⚠ Important Disclaimer</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              All provider names, addresses, phone numbers, hours, and ratings shown are <strong>demo data only</strong>. This application does not display real healthcare providers or real availability. Always independently verify healthcare information before visiting any provider.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareFinder;
