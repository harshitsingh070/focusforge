import React from 'react';
import { UserPreferences } from '../../types';

interface PreferencesProps {
  value: UserPreferences;
  onChange: (value: UserPreferences) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ value, onChange }) => (
  <section className="card">
    <h2 className="font-display text-xl font-bold text-gray-900">Preferences</h2>
    <p className="mt-1 text-sm text-ink-muted">Personalize reminders and visual defaults.</p>

    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <label htmlFor="pref-theme" className="mb-1 block text-sm font-semibold text-gray-700">
          Theme
        </label>
        <select
          id="pref-theme"
          className="select-field"
          value={value.theme}
          onChange={(event) => onChange({ ...value, theme: event.target.value as UserPreferences['theme'] })}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block font-semibold text-gray-900">Email reminders</span>
            <span className="block text-sm text-ink-muted">Receive inactivity reminders over email.</span>
          </span>
          <input
            type="checkbox"
            checked={value.emailReminders}
            onChange={(event) => onChange({ ...value, emailReminders: event.target.checked })}
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block font-semibold text-gray-900">Weekly summary</span>
            <span className="block text-sm text-ink-muted">Enable a weekly performance summary.</span>
          </span>
          <input
            type="checkbox"
            checked={value.weeklySummary}
            onChange={(event) => onChange({ ...value, weeklySummary: event.target.checked })}
            className="h-4 w-4"
          />
        </label>
      </div>
    </div>
  </section>
);

export default Preferences;
