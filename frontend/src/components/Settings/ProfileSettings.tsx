import React from 'react';
import { ProfileSettingsData } from '../../types';

interface ProfileSettingsProps {
  value: ProfileSettingsData;
  onChange: (value: ProfileSettingsData) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ value, onChange }) => {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
        <div className="relative group shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <span className="material-symbols-outlined text-[32px] text-slate-400">person</span>
          </div>
          <button className="absolute -bottom-1 -right-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-500 hover:text-violet-600 dark:text-slate-300 dark:hover:text-white shadow-sm transition-colors">
            <span className="material-symbols-outlined block text-[14px]">photo_camera</span>
          </button>
        </div>
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="profile-username" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Username
              </label>
              <input
                id="profile-username"
                type="text"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white transition-all focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                value={value.username}
                onChange={(event) => onChange({ ...value, username: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white transition-all focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                value={value.email}
                onChange={(event) => onChange({ ...value, email: event.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white transition-all focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
              value={value.bio}
              onChange={(event) => onChange({ ...value, bio: event.target.value })}
              placeholder="Share what you are currently building."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSettings;
