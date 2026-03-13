import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, login } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';

const features = [
  { icon: '🎯', title: 'Daily Clarity', desc: 'Goal cards, reminders & streak protection' },
  { icon: '🏆', title: 'Motivation Loop', desc: 'Badges, streaks & milestone scoring' },
  { icon: '📊', title: 'Smart Leaderboards', desc: 'Compete globally or within your circles' },
];

const EyeIcon = ({ show }: { show: boolean }) =>
  show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate(isAdminEmail(result.payload.user.email) ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">

      {/* ── Left panel: ambient visual ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex-col">
        {/* Glowing orbs */}
        <div className="absolute top-[15%] left-[20%] h-72 w-72 rounded-full bg-violet-600/30 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[25%] right-[15%] h-64 w-64 rounded-full bg-indigo-500/20 blur-[70px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[55%] left-[10%] h-48 w-48 rounded-full bg-purple-400/15 blur-[60px] animate-pulse" style={{ animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40 transition-transform duration-200 group-hover:scale-105">
              <span className="text-sm font-bold text-white">FF</span>
            </div>
            <span className="text-lg font-bold text-white">FocusForge</span>
          </Link>

          {/* Hero text */}
          <div className="my-auto">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Productivity Platform</p>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Focus on<br />what matters.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Track daily effort, protect your streaks, and compete on transparent leaderboards.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3.5 group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-base transition-all duration-200 group-hover:bg-violet-500/30 group-hover:border-violet-400/50">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="mt-10 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-400">Streak strength holding steady</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 w-[82%] transition-all duration-1000" />
                </div>
                <span className="text-xs font-bold text-white">82%</span>
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-xs mt-auto">© 2025 FocusForge. Build habits every day.</p>
        </div>
      </div>

      {/* ── Right panel: sign-in form ── */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg shadow-violet-500/30">
              <span className="text-sm font-bold text-white">FF</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">FocusForge</span>
          </Link>

          <div className="mb-8">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-widest uppercase mb-2">Welcome back</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in to continue</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Build habits. Track progress. Achieve goals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 ${
                  error
                    ? 'border-red-400 dark:border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 ${
                    error
                      ? 'border-red-400 dark:border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3" role="alert">
                <span className="text-red-500 text-sm">⚠️</span>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="relative w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                Create one
              </Link>
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              <Link to="/rules" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                View Platform Rules
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
