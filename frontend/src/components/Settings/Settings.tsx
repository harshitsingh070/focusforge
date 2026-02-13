import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPrivacySettings, updatePrivacySettings, clearUpdateSuccess } from '../../store/settingsSlice';
import Navbar from '../Layout/Navbar';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { privacySettings, loading, updateSuccess } = useSelector((state: RootState) => state.settings);

  const [showActivity, setShowActivity] = useState<string>('PUBLIC');
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    dispatch(fetchPrivacySettings());
  }, [dispatch]);

  useEffect(() => {
    if (privacySettings) {
      setShowActivity(privacySettings.showActivity || 'PUBLIC');
      setShowLeaderboard(privacySettings.showLeaderboard !== false);
      setShowBadges(privacySettings.showBadges !== false);
      setShowProgress(privacySettings.showProgress !== false);
    }
  }, [privacySettings]);

  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    }
  }, [updateSuccess, dispatch]);

  const handleSave = () => {
    dispatch(
      updatePrivacySettings({
        showActivity,
        showLeaderboard,
        showBadges,
        showProgress,
      })
    );
  };

  const toggleOptions = [
    {
      id: 'show-leaderboard',
      label: 'Show on Leaderboard',
      description: 'Appear in public leaderboards.',
      checked: showLeaderboard,
      onChange: setShowLeaderboard,
    },
    {
      id: 'show-badges',
      label: 'Show Badges',
      description: 'Display earned badges publicly.',
      checked: showBadges,
      onChange: setShowBadges,
    },
    {
      id: 'show-progress',
      label: 'Show Progress',
      description: 'Share your progress and streaks.',
      checked: showProgress,
      onChange: setShowProgress,
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-4xl">
        <section className="section-heading">
          <p className="status-chip">Account Controls</p>
          <h1 className="section-title mt-3">Settings</h1>
          <p className="section-subtitle">Manage your privacy and account preferences.</p>
        </section>

        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900">Privacy Settings</h2>

          <div className="app-divider mt-6 pt-6">
            <label className="mb-3 block text-sm font-semibold text-gray-900">Activity Visibility</label>
            <p className="mb-4 text-sm text-ink-muted">Choose who can see your daily activities and logs.</p>

            <div className="grid gap-3">
              {[
                { value: 'PUBLIC', title: 'Public', detail: 'Anyone can see your activities.' },
                { value: 'FRIENDS', title: 'Friends Only', detail: 'Only friends can see your activities.' },
                { value: 'PRIVATE', title: 'Private', detail: 'Only you can see your activities.' },
              ].map((option) => {
                const active = showActivity === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                      active ? 'border-primary-200 bg-primary-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="showActivity"
                      value={option.value}
                      checked={active}
                      onChange={(e) => setShowActivity(e.target.value)}
                      className="mt-1 h-4 w-4 text-primary-600"
                    />
                    <span>
                      <span className="block font-semibold text-gray-900">{option.title}</span>
                      <span className="block text-sm text-ink-muted">{option.detail}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="app-divider mt-6 space-y-4 pt-6">
            {toggleOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-ink-muted">{option.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    id={option.id}
                    type="checkbox"
                    checked={option.checked}
                    onChange={(e) => option.onChange(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-primary-600" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>

          {updateSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Settings saved successfully.
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </section>
      </main>
    </div>
  );
};

export default Settings;
