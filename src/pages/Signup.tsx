import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all';

// Mirrors the backend rules in backend/app/schemas/auth.py
function validate(name: string, email: string, pw: string, confirm: string): string {
  if (!name.trim()) return 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password needs at least one uppercase letter.';
  if (!/\d/.test(pw)) return 'Password needs at least one number.';
  if (pw !== confirm) return 'Passwords do not match.';
  return '';
}

const Signup: React.FC = () => {
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', pw: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate(form.name, form.email, form.pw, form.confirm);
    if (problem) { setError(problem); return; }
    setError('');
    setBusy(true);
    try {
      await register(form.email, form.name.trim(), form.pw);
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed.';
      setError(
        msg.includes('Failed to fetch')
          ? 'Cannot reach the server. The backend is not running. Use "Continue as demo user" below.'
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Free demo account for HealthBridge AI">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">Full name</label>
          <input id="name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="pw" className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
          <input id="pw" type="password" autoComplete="new-password" value={form.pw} onChange={set('pw')} placeholder="8+ characters, 1 uppercase, 1 number" className={inputCls} />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm password</label>
          <input id="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" className={inputCls} />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={busy}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold text-sm rounded-xl transition-colors">
          {busy ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <button onClick={() => { demoLogin(); navigate('/'); }}
        className="w-full mt-3 py-2.5 bg-accent-50 hover:bg-accent-100 text-accent-700 border border-accent-200 font-semibold text-sm rounded-xl transition-colors">
        Continue as demo user
      </button>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Log in</Link>
      </p>
    </AuthShell>
  );
};

export default Signup;
