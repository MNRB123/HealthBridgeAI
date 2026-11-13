import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApptStatus = 'upcoming' | 'completed' | 'cancelled';

interface DemoAppointment {
  id: string;
  title: string;
  provider_name: string;
  provider_type: string;
  location: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  notes: string;
  is_telehealth: boolean;
  status: ApptStatus;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_APPOINTMENTS: DemoAppointment[] = [
  { id: '1', title: 'Annual General Checkup', provider_name: 'Dr. Demo Smith', provider_type: 'Primary Care', location: '245 Main St, Demo City, NY 10001', appointment_date: 'Jan 15, 2027', appointment_time: '10:00 AM', duration_minutes: 45, notes: 'Bring insurance card and list of current medications.', is_telehealth: false, status: 'upcoming' },
  { id: '2', title: 'Telehealth Mental Wellness Session', provider_name: 'Dr. Demo Rivera', provider_type: 'Mental Health', location: 'Video Call (Demo)', appointment_date: 'Jan 22, 2027', appointment_time: '2:30 PM', duration_minutes: 50, notes: 'Follow-up from last session. Bring journal notes.', is_telehealth: true, status: 'upcoming' },
  { id: '3', title: 'Dental Cleaning & X-Ray', provider_name: 'Demo Dental Clinic', provider_type: 'Dental', location: '17 Park Blvd, Demo City, NY 10004', appointment_date: 'Oct 10, 2026', appointment_time: '9:00 AM', duration_minutes: 60, notes: '', is_telehealth: false, status: 'completed' },
  { id: '4', title: 'Blood Pressure Follow-up', provider_name: 'Dr. Demo Lee', provider_type: 'Cardiology', location: '500 Broadway, Demo City, NY 10003', appointment_date: 'Oct 3, 2026', appointment_time: '3:15 PM', duration_minutes: 30, notes: 'Bring home BP log readings.', is_telehealth: false, status: 'completed' },
  { id: '5', title: 'Flu Shot — Cancelled', provider_name: 'Demo Pharmacy Five', provider_type: 'Pharmacy', location: '100 Demo Ave, NY 10005', appointment_date: 'Sep 28, 2026', appointment_time: '11:00 AM', duration_minutes: 15, notes: '', is_telehealth: false, status: 'cancelled' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const statusConfig: Record<ApptStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200', dot: 'bg-primary-500' },
  completed: { label: 'Completed', color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-200', dot: 'bg-success-500' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
};

const typeColors: Record<string, string> = {
  'Primary Care': 'bg-primary-100 text-primary-700',
  'Mental Health': 'bg-accent-100 text-accent-700',
  'Dental': 'bg-success-100 text-success-700',
  'Cardiology': 'bg-red-100 text-red-700',
  'Pharmacy': 'bg-warning-100 text-warning-700',
};

// Parse "YYYY-MM-DD" as a LOCAL date. new Date("YYYY-MM-DD") is UTC and can show the previous day in the US.
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// "14:30" -> "2:30 PM"
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

interface NewApptForm {
  title: string;
  provider_name: string;
  provider_type: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
  is_telehealth: boolean;
}

const EMPTY_FORM: NewApptForm = {
  title: '', provider_name: '', provider_type: 'Primary Care',
  location: '', date: '', time: '', duration: '30', notes: '', is_telehealth: false,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useLocalStorage<DemoAppointment[]>('hb_appointments', DEMO_APPOINTMENTS);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rsDate, setRsDate] = useState('');
  const [rsTime, setRsTime] = useState('');
  const [activeTab, setActiveTab] = useState<ApptStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewApptForm>(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const filtered = appointments.filter(a => activeTab === 'all' || a.status === activeTab);
  const upcoming = appointments.filter(a => a.status === 'upcoming');

  const handleSave = () => {
    if (!form.title.trim() || !form.date || !form.time) {
      setFormError('Title, date, and time are required.');
      return;
    }
    setFormError('');
    const newAppt: DemoAppointment = {
      id: Date.now().toString(),
      title: form.title,
      provider_name: form.provider_name,
      provider_type: form.provider_type,
      location: form.is_telehealth ? 'Video Call (Demo)' : form.location,
      appointment_date: fmtDate(form.date),
      appointment_time: fmtTime(form.time),
      duration_minutes: parseInt(form.duration),
      notes: form.notes,
      is_telehealth: form.is_telehealth,
      status: 'upcoming',
    };
    setAppointments(prev => [newAppt, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReschedule = (id: string) => {
    if (!rsDate || !rsTime) return;
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, appointment_date: fmtDate(rsDate), appointment_time: fmtTime(rsTime) } : a));
    setRescheduleId(null);
    setRsDate('');
    setRsTime('');
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as ApptStatus } : a));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDelete = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your healthcare appointments — <span className="text-warning-600 font-medium">demo data only</span>
          </p>
        </div>
        <button
          onClick={() => { setShowForm(p => !p); setFormError(''); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-warning-600 hover:bg-warning-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            {showForm
              ? <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              : <><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/></>
            }
          </svg>
          {showForm ? 'Cancel' : 'Book Appointment'}
        </button>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-success-50 border border-success-200 rounded-xl animate-fade-in">
          <svg className="w-4 h-4 text-success-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-sm font-semibold text-success-700">Demo appointment added successfully!</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: appointments.length, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-100' },
          { label: 'Upcoming', value: upcoming.length, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
          { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-100' },
          { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3 shadow-sm`}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* New appointment form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 animate-slide-up">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-warning-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book New Appointment (Demo)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Appointment Title <span className="text-red-400">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Annual Checkup, Dental Cleaning..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 focus:border-warning-400 transition-all" />
            </div>

            {/* Provider name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provider Name</label>
              <input type="text" value={form.provider_name} onChange={e => setForm(p => ({ ...p, provider_name: e.target.value }))}
                placeholder="e.g. Dr. Smith"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 transition-all" />
            </div>

            {/* Provider type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provider Type</label>
              <select value={form.provider_type} onChange={e => setForm(p => ({ ...p, provider_type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 transition-all">
                {['Primary Care', 'Mental Health', 'Dental', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pharmacy', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 transition-all" />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Time <span className="text-red-400">*</span></label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 transition-all" />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duration</label>
              <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 transition-all">
                {['15', '30', '45', '60', '90', '120'].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="Address or clinic name"
                disabled={form.is_telehealth}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 disabled:opacity-50 transition-all" />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2} placeholder="Anything to remember for this appointment..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-warning-300 resize-none transition-all" />
            </div>

            {/* Telehealth toggle */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <button type="button" role="switch" aria-checked={form.is_telehealth} onClick={() => setForm(p => ({ ...p, is_telehealth: !p.is_telehealth }))} className={`relative w-9 h-5 rounded-full transition-colors ${form.is_telehealth ? 'bg-accent-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_telehealth ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">This is a telehealth / video appointment</span>
              </label>
            </div>
          </div>

          {formError && <p className="text-xs text-red-600 font-medium mt-3">{formError}</p>}

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-warning-600 hover:bg-warning-700 text-white font-semibold text-sm rounded-xl transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Save Appointment (Demo)
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
              Discard
            </button>
            <span className="ml-auto text-[10px] text-gray-400">Saved in this browser only</span>
          </div>
        </div>
      )}

      {/* Next appointment highlight */}
      {upcoming.length > 0 && (
        <div className="bg-gradient-to-r from-warning-600 to-warning-500 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Next Appointment</p>
              <p className="text-lg font-bold text-white">{upcoming[0].title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-sm text-white/80">{upcoming[0].appointment_date} · {upcoming[0].appointment_time}</span>
                {upcoming[0].is_telehealth && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/20">📹 Telehealth</span>}
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/20">Demo Data</span>
              </div>
            </div>
            <button onClick={() => setSelectedId(upcoming[0].id)}
              className="flex-shrink-0 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl border border-white/20 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs + list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(tab => {
            const count = tab === 'all' ? appointments.length : appointments.filter(a => a.status === tab).length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-3 text-xs font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-warning-500 text-warning-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <span className="text-3xl">📅</span>
              <p className="text-sm font-semibold text-gray-700 mt-3">No {activeTab !== 'all' ? activeTab : ''} appointments</p>
              <p className="text-xs text-gray-400 mt-1">Book one using the button above</p>
            </div>
          )}
          {filtered.map(appt => {
            const sc = statusConfig[appt.status];
            const tc = typeColors[appt.provider_type] ?? 'bg-gray-100 text-gray-600';
            const isSelected = selectedId === appt.id;
            return (
              <div key={appt.id} className={`transition-colors ${isSelected ? 'bg-warning-50' : 'hover:bg-gray-50/50'}`}>
                <button onClick={() => setSelectedId(isSelected ? null : appt.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-4">
                  {/* Date box */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="bg-warning-50 border border-warning-200 rounded-xl px-1 py-1.5">
                      <p className="text-[9px] font-bold text-warning-600 uppercase">{appt.appointment_date.split(' ')[0]}</p>
                      <p className="text-lg font-bold text-warning-800 leading-none">{appt.appointment_date.split(' ')[1]?.replace(',', '')}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{appt.title}</span>
                        {appt.is_telehealth && <span className="text-[10px] font-bold text-accent-600 bg-accent-50 border border-accent-200 px-1.5 py-0.5 rounded-full">📹 Telehealth</span>}
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border} flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {appt.provider_name && <span className="text-xs text-gray-600">{appt.provider_name}</span>}
                      {appt.provider_name && <span className="text-gray-200">·</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${tc}`}>{appt.provider_type}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-500">{appt.appointment_time} · {appt.duration_minutes} min</span>
                    </div>
                    {appt.location && <p className="text-xs text-gray-400 mt-0.5 truncate">{appt.location}</p>}
                  </div>

                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${isSelected ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="px-5 pb-4 ml-16 animate-fade-in">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                      {appt.notes && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-xs text-gray-700">{appt.notes}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {appt.status === 'upcoming' && (
                          <>
                            <button
                              onClick={() => setRescheduleId(rescheduleId === appt.id ? null : appt.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Reschedule
                            </button>
                            <button onClick={() => handleCancel(appt.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                              Cancel Appointment
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(appt.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          Delete
                        </button>
                      </div>
                      {rescheduleId === appt.id && (
                        <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-gray-200">
                          <div>
                            <label htmlFor={`rs-date-${appt.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">New date</label>
                            <input id={`rs-date-${appt.id}`} type="date" value={rsDate} onChange={e => setRsDate(e.target.value)}
                              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
                          </div>
                          <div>
                            <label htmlFor={`rs-time-${appt.id}`} className="block text-[10px] font-bold text-gray-500 uppercase mb-1">New time</label>
                            <input id={`rs-time-${appt.id}`} type="time" value={rsTime} onChange={e => setRsTime(e.target.value)}
                              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
                          </div>
                          <button onClick={() => handleReschedule(appt.id)} disabled={!rsDate || !rsTime}
                            className="px-3 py-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg">
                            Confirm
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-xs font-bold text-amber-800 mb-1">⚠ Demo Application</p>
        <p className="text-[11px] text-amber-700 leading-relaxed">
          All appointments shown are demonstration data. No real providers, locations, or medical information is used.
          Changes are saved in this browser only (local storage) and are not sent to any server.
        </p>
      </div>
    </div>
  );
};

export default Appointments;
