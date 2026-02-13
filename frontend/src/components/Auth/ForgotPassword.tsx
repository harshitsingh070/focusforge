import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      setMessage('Password reset link sent. Check your email.');
    } catch (requestError: any) {
      setSubmitted(true);
      setError(requestError?.message || 'Password reset endpoint is not available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <section className="card w-full max-w-lg">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Account Recovery</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Enter your account email. Password reset endpoint is not configured yet in backend.
          </p>
        </div>

        {submitted ? (
          <div className={`rounded-xl border p-4 ${error ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className={`text-sm ${error ? 'text-amber-800' : 'text-emerald-800'}`}>
              {message ||
                `Request captured for ${email}. Backend reset endpoint is currently not configured.`}
            </p>
            {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="input-field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          Back to{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
};

export default ForgotPassword;
