import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { clearError, signup } from '../../store/authSlice';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const hasConfirmPassword = formData.confirmPassword.trim().length > 0;

  const getPasswordStrengthScore = (password: string): number => {
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
      score += 1;
    }

    if (/\d/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    return score;
  };

  const passwordStrengthScore = getPasswordStrengthScore(formData.password);
  const passwordStrengthTone =
    passwordStrengthScore <= 1 ? 'weak' : passwordStrengthScore <= 2 ? 'medium' : 'strong';
  const passwordStrengthLabel =
    passwordStrengthScore <= 1 ? 'Weak password' : passwordStrengthScore <= 2 ? 'Decent password' : 'Strong password';

  const getInputStatusClass = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
    if (field === 'username') {
      return formData.username.trim().length >= 3 ? ' is-valid' : '';
    }

    if (field === 'email') {
      return emailLooksValid ? ' is-valid' : '';
    }

    if (field === 'password') {
      return formData.password.length > 0 && passwordStrengthScore >= 2 ? ' is-valid' : '';
    }

    if (hasConfirmPassword && !passwordsMatch) {
      return ' has-error';
    }

    return hasConfirmPassword && passwordsMatch ? ' is-valid' : '';
  };

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
    <div className="page-shell register-page-shell">
      <div className="register-grid">
        <section className="card register-card register-value-card hidden lg:flex">
          <p className="status-chip mb-4">New Profile</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-gray-900 register-value-title">
            Turn your goals into daily wins.
          </h1>
          <p className="mt-4 text-base text-ink-muted register-value-copy">
            Create a profile and start tracking habits with clean analytics, streaks, and leaderboard progress.
          </p>

          <div className="register-value-cue" aria-hidden="true">
            <span className="register-cue-ring">
              <span className="register-cue-ring-core">74%</span>
            </span>
            <div className="register-cue-text-wrap">
              <span className="register-cue-flame">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M13.8 2.1c.3 2.4-.5 3.8-1.9 5.1c-1.6 1.5-2.6 3-2.6 5.2a4.7 4.7 0 0 0 9.4 0c0-2.2-1.1-3.8-2.9-5.6c-.9-.8-1.6-1.8-2-3.3Zm-1.7 8.2c.1 1-.3 1.6-.9 2.2c-.7.6-1.1 1.3-1.1 2.2a2.9 2.9 0 0 0 5.8 0c0-.9-.5-1.7-1.3-2.5c-.4-.4-.7-.8-.9-1.5Z" />
                </svg>
              </span>
              <p>Momentum signal: stable</p>
            </div>
          </div>

          <ul className="register-benefit-list">
            <li>Keep your streak active with daily consistency checks.</li>
            <li>Measure leaderboard growth with clear weekly snapshots.</li>
          </ul>
        </section>

        <section className="card register-card register-form-card w-full">
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
              <div className={`register-input-wrap${getInputStatusClass('username')}`}>
                <input
                  id="username"
                  type="text"
                  className="input-field register-input"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                  required
                  minLength={3}
                  placeholder="Pick a unique username"
                />
                <span className="register-input-status" aria-hidden="true" />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className={`register-input-wrap${getInputStatusClass('email')}`}>
                <input
                  id="register-email"
                  type="email"
                  className="input-field register-input"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  required
                  placeholder="you@example.com"
                />
                <span className="register-input-status" aria-hidden="true" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className={`register-input-wrap register-password-wrap${getInputStatusClass('password')}`}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field register-input register-password-input"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <span className="register-input-status" aria-hidden="true" />
                </div>
                {formData.password && (
                  <div className="register-password-strength" aria-live="polite">
                    <span className={`register-strength-bar register-strength-${passwordStrengthTone}`} aria-hidden="true">
                      <span style={{ width: `${(passwordStrengthScore / 4) * 100}%` }} />
                    </span>
                    <span className="register-strength-label">{passwordStrengthLabel}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className={`register-input-wrap register-password-wrap${getInputStatusClass('confirmPassword')}`}>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field register-input register-password-input"
                    value={formData.confirmPassword}
                    onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                  <span className="register-input-status" aria-hidden="true" />
                </div>
              </div>
            </div>

            {!passwordsMatch && hasConfirmPassword && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Passwords do not match</p>
            )}

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="btn-primary register-submit-btn w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-secondary-links">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="register-link-primary">
                Sign in
              </Link>
            </p>
            <p>
              Need full rules?{' '}
              <Link to="/rules" className="register-link-rules">
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
