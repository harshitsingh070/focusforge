import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, login } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';
import './Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const getInputStatusClass = (value: string) => {
    if (error) {
      return ' has-error';
    }

    if (value.trim().length > 0) {
      return ' is-ready';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate(isAdminEmail(result.payload.user.email) ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="page-shell login-page-shell">
      <div className="login-grid">
        <div className="login-card-bridge" aria-hidden="true" />

        <section className="card login-card login-value-card hidden flex-col justify-between lg:flex">
          <div>
            <p className="status-chip mb-4">FocusForge Platform</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-gray-900 login-value-title">
              Build momentum, not just plans.
            </h1>
            <p className="mt-4 text-base text-ink-muted login-value-copy">
              Track daily effort, protect your streaks, and compete with context-aware leaderboards.
            </p>

            <div className="login-value-cue" aria-hidden="true">
              <span className="login-value-ring">
                <span className="login-value-ring-core">82%</span>
              </span>
              <div className="login-value-cue-text">
                <span className="login-value-flame">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path d="M13.8 2.1c.3 2.4-.5 3.8-1.9 5.1c-1.6 1.5-2.6 3-2.6 5.2a4.7 4.7 0 0 0 9.4 0c0-2.2-1.1-3.8-2.9-5.6c-.9-.8-1.6-1.8-2-3.3Zm-1.7 8.2c.1 1-.3 1.6-.9 2.2c-.7.6-1.1 1.3-1.1 2.2a2.9 2.9 0 0 0 5.8 0c0-.9-.5-1.7-1.3-2.5c-.4-.4-.7-.8-.9-1.5Z" />
                  </svg>
                </span>
                <p>Streak strength holding steady</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="soft-card">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Daily Clarity</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">Goal progress cards and reminders</p>
            </div>
            <div className="soft-card">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Motivation Loop</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">Badges, streaks, and milestone scoring</p>
            </div>
          </div>
        </section>

        <section className="card login-card login-form-card w-full">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Welcome back</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-gray-900">Sign in to FocusForge</h2>
            <p className="mt-2 text-sm text-ink-muted">Build habits. Track progress. Achieve goals.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className={`login-input-wrap${getInputStatusClass(formData.email)}`}>
                <input
                  id="email"
                  type="email"
                  className="input-field login-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                />
                <span className="login-input-status" aria-hidden="true" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className={`login-input-wrap${getInputStatusClass(formData.password)}`}>
                <input
                  id="password"
                  type="password"
                  className="input-field login-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  required
                />
                <span className="login-input-status" aria-hidden="true" />
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="login-aux-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary login-submit-btn w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-secondary-links">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="login-secondary-link">
                Create one
              </Link>
            </p>
            <p>
              Need full rules?{' '}
              <Link to="/rules" className="login-secondary-link">
                View Platform Rules
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
