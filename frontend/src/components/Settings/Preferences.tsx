import React from 'react';
import { UserPreferences } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface PreferencesProps {
  value: UserPreferences;
  onChange: (value: UserPreferences) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ value, onChange }) => {
  return (
    <>
      <section className={`${styles.dashboardPanelCard} mb-8 rounded-2xl p-6 sm:p-8`}>
        <div className="mb-6">
          <h3 className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>Preferences</h3>
          <p className={`mt-1 text-sm ${styles.dashboardGoalMeta}`}>Set your defaults for reminders and appearance.</p>
        </div>
        <div className="space-y-3">
          <div className={`${styles.dashboardGoalCard} flex items-center justify-between rounded-xl p-4`}>
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 dark:bg-violet-600/10 p-2.5 text-violet-600 dark:text-violet-500">
                <span className="material-symbols-outlined block text-[20px]">notifications</span>
              </div>
              <div>
                <p className={`text-sm font-bold ${styles.dashboardGoalTitle}`}>Email reminders</p>
                <p className={`text-xs ${styles.dashboardGoalMeta}`}>Receive inactivity reminders over email.</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={value.emailReminders}
                onChange={() => onChange({ ...value, emailReminders: !value.emailReminders })}
              />
              <div className="peer h-5 w-10 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          <div className={`${styles.dashboardGoalCard} flex items-center justify-between rounded-xl p-4`}>
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 dark:bg-violet-600/10 p-2.5 text-violet-600 dark:text-violet-500">
                <span className="material-symbols-outlined block text-[20px]">mail</span>
              </div>
              <div>
                <p className={`text-sm font-bold ${styles.dashboardGoalTitle}`}>Weekly summary</p>
                <p className={`text-xs ${styles.dashboardGoalMeta}`}>Enable a weekly performance summary.</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={value.weeklySummary}
                onChange={() => onChange({ ...value, weeklySummary: !value.weeklySummary })}
              />
              <div className="peer h-5 w-10 rounded-full bg-slate-300 dark:bg-slate-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
        </div>
      </section>

      <section className={`${styles.dashboardPanelCard} mb-8 rounded-2xl p-6 sm:p-8`}>
        <div className="mb-6">
          <h3 className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>Theme</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group cursor-pointer" onClick={() => onChange({ ...value, theme: 'light' })}>
            <div className={`relative flex aspect-video w-full flex-col gap-1.5 overflow-hidden rounded-xl p-2 transition-all ${value.theme === 'light' ? 'border-2 border-violet-600 ring-4 ring-violet-600/10 bg-slate-200' : 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}>
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-700"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-700"></div>
              </div>
              <div className="flex-1 rounded-md bg-white border border-slate-200"></div>
              {value.theme === 'light' && (
                <div className="absolute right-2 top-2">
                  <span className="material-symbols-outlined block text-base text-violet-600 [font-variation-settings:'FILL'1]">check_circle</span>
                </div>
              )}
            </div>
            <p className={`mt-3 text-center text-xs ${value.theme === 'light' ? 'font-bold text-violet-600' : 'font-medium text-slate-500'}`}>Light</p>
          </div>

          <div className="group cursor-pointer" onClick={() => onChange({ ...value, theme: 'dark' })}>
            <div className={`relative flex aspect-video w-full flex-col gap-1.5 overflow-hidden rounded-xl p-2 transition-all ${value.theme === 'dark' ? 'border-2 border-violet-600 ring-4 ring-violet-600/10 bg-slate-900' : 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}>
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
              </div>
              <div className="flex-1 rounded-md border border-slate-800/50 bg-slate-950"></div>
              {value.theme === 'dark' && (
                <div className="absolute right-2 top-2">
                  <span className="material-symbols-outlined block text-base text-violet-600 [font-variation-settings:'FILL'1]">check_circle</span>
                </div>
              )}
            </div>
            <p className={`mt-3 text-center text-xs ${value.theme === 'dark' ? 'font-bold text-violet-600' : 'font-medium text-slate-500'}`}>Dark</p>
          </div>

          <div className="group cursor-pointer" onClick={() => onChange({ ...value, theme: 'system' })}>
            <div className={`relative flex aspect-video w-full flex-col gap-1.5 overflow-hidden rounded-xl transition-all ${value.theme === 'system' ? 'border-2 border-violet-600 ring-4 ring-violet-600/10' : 'border border-slate-200 dark:border-slate-800'}`}>
              <div className="flex h-full">
                <div className="flex w-1/2 flex-col gap-1.5 bg-slate-200 p-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                  <div className="flex-1 rounded-bl-md rounded-tl-md bg-white border-y border-l border-slate-300"></div>
                </div>
                <div className="flex w-1/2 flex-col gap-1.5 bg-slate-900 p-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-700"></div>
                  <div className="flex-1 rounded-br-md rounded-tr-md border-y border-r border-slate-800 bg-slate-950"></div>
                </div>
              </div>
              {value.theme === 'system' && (
                <div className="absolute right-2 top-2">
                  <span className="material-symbols-outlined block text-base text-violet-600 [font-variation-settings:'FILL'1]">check_circle</span>
                </div>
              )}
            </div>
            <p className={`mt-3 text-center text-xs ${value.theme === 'system' ? 'font-bold text-violet-600' : 'font-medium text-slate-500'}`}>System</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Preferences;
