import React from 'react';

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettingsProps {
  value: PasswordFormState;
  onChange: (value: PasswordFormState) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  message,
}) => (
  <section className="card">
    <h2 className="font-display text-xl font-bold text-gray-900">Security</h2>
    <p className="mt-1 text-sm text-ink-muted">Change your password without leaving the settings page.</p>

    <div className="mt-4 space-y-3">
      <div>
        <label htmlFor="current-password" className="mb-1 block text-sm font-semibold text-gray-700">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          className="input-field"
          value={value.currentPassword}
          onChange={(event) => onChange({ ...value, currentPassword: event.target.value })}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-semibold text-gray-700">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          className="input-field"
          value={value.newPassword}
          onChange={(event) => onChange({ ...value, newPassword: event.target.value })}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-semibold text-gray-700">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          className="input-field"
          value={value.confirmPassword}
          onChange={(event) => onChange({ ...value, confirmPassword: event.target.value })}
          autoComplete="new-password"
        />
      </div>
    </div>

    {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {success && (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
        {message || 'Password updated successfully.'}
      </div>
    )}

    <button
      type="button"
      onClick={onSubmit}
      disabled={
        loading ||
        !value.currentPassword.trim() ||
        !value.newPassword.trim() ||
        !value.confirmPassword.trim() ||
        value.newPassword !== value.confirmPassword
      }
      className="btn-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Updating...' : 'Update Password'}
    </button>

    {value.newPassword && value.confirmPassword && value.newPassword !== value.confirmPassword && (
      <p className="mt-2 text-xs text-red-600">New password and confirmation must match.</p>
    )}
  </section>
);

export default SecuritySettings;
