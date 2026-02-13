import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, login } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    <div className="page-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <section className="card hidden flex-col justify-between lg:flex">
          <div>
            <p className="status-chip mb-4">FocusForge Platform</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-gray-900">
              Build momentum, not just plans.
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-muted">
              Track daily effort, protect your streaks, and compete with context-aware leaderboards.
            </p>
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

        <section className="card w-full max-w-xl justify-self-center">
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
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
              />
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-ink-muted">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-brand hover:underline">
                Create one
              </Link>
            </p>
            <p>
              Need full rules?{' '}
              <Link to="/rules" className="font-semibold text-brand hover:underline">
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
