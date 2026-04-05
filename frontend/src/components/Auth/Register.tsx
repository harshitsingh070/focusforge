import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, signup } from '../../store/authSlice';
import CircularLogo from '../ui/CircularLogo';

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

const getPasswordStrengthScore = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const strengthConfig = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Decent', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-yellow-400' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const passwordsMatch = formData.password === formData.confirmPassword;
  const hasConfirmPassword = formData.confirmPassword.trim().length > 0;
  const score = getPasswordStrengthScore(formData.password);
  const strength = strengthConfig[score] || strengthConfig[0];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearError());
    if (!passwordsMatch) return;
    const result = await dispatch(signup({ username: formData.username, email: formData.email, password: formData.password }));
    if (signup.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 sm:p-8">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
            <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You're all set!</h2>
          <p className="text-slate-500 dark:text-slate-400">Redirecting you to sign in…</p>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 animate-[progress_2.2s_ease-in-out_forwards]" style={{ width: '100%', transformOrigin: 'left', animation: 'grow 2.2s linear forwards' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950">

      {/* ── Left ambient panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex-col p-12">
        <div className="absolute top-[20%] right-[20%] h-72 w-72 rounded-full bg-violet-600/25 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[30%] left-[10%] h-56 w-56 rounded-full bg-indigo-500/20 blur-[70px] animate-pulse" style={{ animationDelay: '2s' }} />

        <Link to="/" className="inline-flex items-center gap-2.5 group mb-auto">
          <CircularLogo size="lg" />
          <span className="text-lg font-bold text-white">Discipify</span>
        </Link>

        <div className="my-auto">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">Join the Game</p>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Level up your<br />discipline.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Track habits, earn XP, build streaks, and compete. Gamify your discipline today.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: 'XP', label: 'Earn experience points' },
              { value: '🔥', label: 'Build daily streaks' },
              { value: '🏆', label: 'Unlock achievements' },
              { value: '🎮', label: 'Gamified challenges' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-auto">© 2025 Discipify</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-start justify-center p-5 py-8 sm:p-8 sm:py-10 lg:items-center lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 lg:hidden">
            <CircularLogo size="md" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Discipify</span>
          </Link>

          <div className="mb-8">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 tracking-widest uppercase mb-2">Get started</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Gamify your discipline. Start earning XP today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                minLength={3}
                placeholder="Pick a unique username"
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <input
                id="register-email"
                type="email"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {/* Strength meter */}
              {formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((seg) => (
                      <div key={seg} className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= seg ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  {strength.label && <p className="text-xs text-slate-500 dark:text-slate-400">{strength.label} password</p>}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full rounded-xl border bg-white dark:bg-slate-800/80 px-4 py-3 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 ${
                    hasConfirmPassword && !passwordsMatch
                      ? 'border-red-400 dark:border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                  }`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" onClick={() => setShowConfirmPassword((v) => !v)} aria-label="Toggle confirm password">
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>
              {hasConfirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">Passwords don't match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3" role="alert">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || (hasConfirmPassword && !passwordsMatch)}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">Log in</Link>
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              <Link to="/rules" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">View Platform Rules</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
