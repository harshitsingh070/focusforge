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

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ value, onChange }) => {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control what other users can see.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: 'PUBLIC', title: 'Public', description: 'Anyone can see.' },
          { key: 'FRIENDS', title: 'Friends', description: 'Only friends can see.' },
          { key: 'PRIVATE', title: 'Private', description: 'Only you can see.' },
        ].map((option) => {
          const checked = value.showActivity === option.key;
          return (
            <label
              key={option.key}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${checked
                  ? 'border-violet-600 bg-violet-50 dark:bg-violet-600/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                }`}
            >
              <input
                type="radio"
                name="privacy-visibility"
                checked={checked}
                onChange={() =>
                  onChange({
                    ...value,
                    showActivity: option.key as PrivacySettingsType['showActivity'],
                  })
                }
                className="mt-1 h-4 w-4 appearance-none rounded-full border border-slate-300 bg-white checked:border-[4px] checked:border-violet-600 checked:bg-white dark:border-slate-600 dark:bg-slate-800 dark:checked:border-violet-500"
              />
              <span>
                <span className="block font-semibold text-slate-900 dark:text-white">{option.title}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
        {toggleOptions.map((option) => {
          const enabled = value[option.key];
          return (
            <div
              key={option.key}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={enabled}
                  onChange={() =>
                    onChange({
                      ...value,
                      [option.key]: !enabled,
                    })
                  }
                />
                <div className="peer h-5 w-10 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PrivacySettings;
