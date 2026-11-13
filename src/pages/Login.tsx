import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

const inputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all';

const Login: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(
        msg.includes('Failed to fetch')
          ? 'Cannot reach the server. The backend is not running. Use "Continue as demo user" below.'
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = () => { demoLogin(); navigate('/'); };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your HealthBridge AI account">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
          <input id="email" type="email" autoComplete="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Your password" className={inputCls} />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={busy}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold text-sm rounded-xl transition-colors">
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button onClick={handleDemo}
        className="w-full py-2.5 bg-accent-50 hover:bg-accent-100 text-accent-700 border border-accent-200 font-semibold text-sm rounded-xl transition-colors">
        Continue as demo user
      </button>
      <p className="text-[11px] text-gray-400 text-center mt-2">No account or backend needed. Uses fictional demo data.</p>

      <p className="text-sm text-gray-500 text-center mt-6">
        New here? <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">Create an account</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
