import React from 'react';

/** Shared two-panel layout for the Login and Sign Up pages. */
const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex bg-gray-50">
    {/* Brand panel — desktop only */}
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 p-12 flex-col justify-between">
      <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">HealthBridge AI</span>
      </div>
      <div className="relative">
        <h2 className="text-3xl font-bold text-white leading-tight mb-3">Healthcare access, made simpler.</h2>
        <p className="text-white/70 text-sm max-w-sm leading-relaxed">
          Compare medicine prices, find affordable care, and support your mental wellness in one place.
        </p>
      </div>
      <p className="relative text-xs text-white/50">Demo application. All data is fictional. Not for medical use.</p>
    </div>

    {/* Form panel */}
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

export default AuthShell;
