import React from 'react';
import { UserPreferences } from '../../types';

interface PreferencesProps {
  value: UserPreferences;
  onChange: (value: UserPreferences) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ value, onChange }) => (
  <section className="card">
    <h2 className="text-2xl font-bold tracking-tight text-[var(--ff-text-900)]">Preferences</h2>
    <p className="mt-1 text-sm text-[var(--ff-text-700)]">Set your defaults for reminders and appearance.</p>

    <div className="mt-4 space-y-3">
      <div className="soft-card p-3">
        <label htmlFor="pref-theme" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
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

      <div className="soft-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--ff-text-900)]">Email reminders</p>
            <p className="text-sm text-ink-muted">Receive inactivity reminders over email.</p>
          </div>
          <button
            type="button"
            className="ff-toggle"
            data-on={String(value.emailReminders)}
            aria-pressed={value.emailReminders}
            onClick={() => onChange({ ...value, emailReminders: !value.emailReminders })}
          />
        </div>
      </div>

      <div className="soft-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--ff-text-900)]">Weekly summary</p>
            <p className="text-sm text-ink-muted">Enable a weekly performance summary.</p>
          </div>
          <button
            type="button"
            className="ff-toggle"
            data-on={String(value.weeklySummary)}
            aria-pressed={value.weeklySummary}
            onClick={() => onChange({ ...value, weeklySummary: !value.weeklySummary })}
          />
        </div>
      </div>
    </div>
  </section>
);

export default Preferences;
