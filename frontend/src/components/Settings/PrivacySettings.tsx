import React from 'react';
import { PrivacySettings as PrivacySettingsType } from '../../types';

interface PrivacySettingsProps {
  value: PrivacySettingsType;
  onChange: (value: PrivacySettingsType) => void;
}

const toggleOptions: Array<{
  key: 'showLeaderboard' | 'showBadges' | 'showProgress';
  label: string;
  description: string;
}> = [
  {
    key: 'showLeaderboard',
    label: 'Show on leaderboard',
    description: 'Include your profile in ranking tables.',
  },
  {
    key: 'showBadges',
    label: 'Show badges',
    description: 'Display earned badges publicly.',
  },
  {
    key: 'showProgress',
    label: 'Show progress',
    description: 'Share streak and progress trends.',
  },
];

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ value, onChange }) => (
  <section className="card">
    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Privacy</h2>
    <p className="mt-1 text-sm text-slate-500">Control what other users can see.</p>

    <div className="mt-4 grid gap-3">
      {[
        { key: 'PUBLIC', title: 'Public', description: 'Anyone can see your activity.' },
        { key: 'FRIENDS', title: 'Friends', description: 'Only friends can see your activity.' },
        { key: 'PRIVATE', title: 'Private', description: 'Only you can see your activity.' },
      ].map((option) => (
        <label
          key={option.key}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
            value.showActivity === option.key ? 'border-primary-200 bg-primary-50' : 'border-slate-200 bg-white'
          }`}
        >
          <input
            type="radio"
            checked={value.showActivity === option.key}
            onChange={() =>
              onChange({
                ...value,
                showActivity: option.key as PrivacySettingsType['showActivity'],
              })
            }
            className="mt-1 h-4 w-4 accent-green-500"
          />
          <span>
            <span className="block font-semibold text-gray-900">{option.title}</span>
            <span className="block text-sm text-ink-muted">{option.description}</span>
          </span>
        </label>
      ))}
    </div>

    <div className="app-divider mt-5 space-y-3 pt-5">
      {toggleOptions.map((option) => {
        const enabled = value[option.key];
        return (
          <div
            key={option.key}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
          >
            <div>
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-ink-muted">{option.description}</p>
            </div>
            <button
              type="button"
              className="ff-toggle"
              data-on={String(enabled)}
              aria-pressed={enabled}
              onClick={() =>
                onChange({
                  ...value,
                  [option.key]: !enabled,
                })
              }
            />
          </div>
        );
      })}
    </div>
  </section>
);

export default PrivacySettings;
