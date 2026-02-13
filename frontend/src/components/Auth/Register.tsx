import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, signup } from '../../store/authSlice';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(clearError());

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await dispatch(
      signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    );

    if (signup.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  if (success) {
    return (
      <div className="page-shell flex items-center justify-center px-4 py-8">
        <div className="card w-full max-w-lg text-center">
          <p className="status-chip mb-4">Account Ready</p>
          <h2 className="font-display text-3xl font-bold text-gray-900">Account Created</h2>
          <p className="mt-2 text-ink-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <section className="card hidden lg:block">
          <p className="status-chip mb-4">New Profile</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-gray-900">
            Turn your goals into daily wins.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted">
            Create a profile and start tracking habits with clean analytics, streaks, and leaderboard progress.
          </p>
        </section>

        <section className="card w-full max-w-xl justify-self-center">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Get started</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-ink-muted">Start your journey to better habits.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={formData.username}
                onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                required
                minLength={3}
                placeholder="Pick a unique username"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                  required
                />
              </div>
            </div>

            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Passwords do not match</p>
            )}

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-ink-muted">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand hover:underline">
                Sign in
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

export default Register;
