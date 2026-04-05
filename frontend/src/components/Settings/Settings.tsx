import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { applyTheme } from '../../utils/theme';
import {
  clearSettingsError,
  clearUpdateSuccess,
  fetchSettings,
  updateSettings,
} from '../../store/settingsSlice';
import { PrivacySettings as PrivacySettingsType, ProfileSettingsData, UserPreferences } from '../../types';
import Preferences from './Preferences';
import PrivacySettings from './PrivacySettings';
import ProfileSettings from './ProfileSettings';
import Button from '../ui/Button';
import styles from '../Dashboard/Dashboard.module.css';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { privacy, preferences, profile, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.settings
  );

  const [privacyState, setPrivacyState] = useState<PrivacySettingsType>(privacy);
  const [preferencesState, setPreferencesState] = useState<UserPreferences>(preferences);
  const [profileState, setProfileState] = useState<ProfileSettingsData>(profile);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);
  useEffect(() => { setPrivacyState(privacy); }, [privacy]);
  useEffect(() => { setPreferencesState(preferences); }, [preferences]);
  useEffect(() => { setProfileState(profile); }, [profile]);
  useEffect(() => { applyTheme(preferencesState.theme); }, [preferencesState.theme]);

  useEffect(() => {
    if (!updateSuccess) return;
    const timer = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    return () => clearTimeout(timer);
  }, [dispatch, updateSuccess]);

  const hasUnsavedChanges = useMemo(() => {
    const privacyChanged = JSON.stringify(privacyState) !== JSON.stringify(privacy);
    const preferencesChanged = JSON.stringify(preferencesState) !== JSON.stringify(preferences);
    const profileChanged = JSON.stringify(profileState) !== JSON.stringify(profile);
    return privacyChanged || preferencesChanged || profileChanged;
  }, [privacy, privacyState, preferences, preferencesState, profile, profileState]);

  const validateProfile = (): string | null => {
    if (!profileState.username.trim()) return 'Username is required.';
    if (profileState.username.trim().length < 3) return 'Username must be at least 3 characters.';
    if (!profileState.email.trim()) return 'Email is required.';
    if (!isValidEmail(profileState.email)) return 'Please enter a valid email address.';
    if (profileState.bio.trim().length > 500) return 'Bio must be 500 characters or less.';
    return null;
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    const validationError = validateProfile();
    if (validationError) { setProfileFormError(validationError); return; }
    setProfileFormError(null);
    dispatch(clearSettingsError());
    dispatch(updateSettings({ privacy: privacyState, preferences: preferencesState, profile: profileState }));
  };

  const handleReset = () => {
    setPrivacyState(privacy);
    setPreferencesState(preferences);
    setProfileState(profile);
    setProfileFormError(null);
    dispatch(clearSettingsError());
  };

  return (
    <>
      <div className={`${styles.dashboardThemeScope} mx-auto w-full max-w-[1280px] px-4 py-6 pb-32 sm:px-8 sm:py-8`}>
        {/* Header banner */}
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Manage your account details and visual preferences.</p>
          </div>
        </section>

        {error && (
          <div className={`${styles.dashboardPanelCard} mb-4 rounded-xl p-3 text-sm`} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>
        )}
        {profileFormError && (
          <div className={`${styles.dashboardPanelCard} mb-4 rounded-xl p-3 text-sm`} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>{profileFormError}</div>
        )}
        {updateSuccess && (
          <div className={`${styles.dashboardPanelCard} mb-4 rounded-xl p-3 text-sm font-semibold`} style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
            Settings saved successfully.
          </div>
        )}

        <ProfileSettings value={profileState} onChange={(next) => { setProfileFormError(null); setProfileState(next); }} />
        <Preferences value={preferencesState} onChange={setPreferencesState} />
        <PrivacySettings value={privacyState} onChange={setPrivacyState} />

        {/* Danger Zone */}
        <section className="mt-20 border-t border-red-500/10 pt-8">
          <h3 className="mb-1 text-lg font-bold text-red-400">Danger Zone</h3>
          <p className={`mb-6 text-sm ${styles.dashboardGoalMeta}`}>Irreversible actions that affect your data and account access.</p>
          <div className={`${styles.dashboardPanelCard} flex flex-col items-start gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between`} style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
            <div>
              <p className={`text-sm font-bold ${styles.dashboardGoalTitle}`}>Delete Account</p>
              <p className={`text-xs ${styles.dashboardGoalMeta}`}>Permanently remove all your tasks and profile data.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => alert('Account deletion not implemented in this demo.')}>
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/90 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md transition-[left] duration-300 dark:border-slate-800 dark:bg-slate-950/90 sm:p-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] lg:[left:var(--ff-sidebar-width)]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipFocus}`}>Unsaved changes</span>
            )}
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={handleReset} disabled={!hasUnsavedChanges || loading}>Reset</Button>
            <Button variant="primary" className="flex-1 sm:flex-none" onClick={handleSave} disabled={!hasUnsavedChanges || loading} loading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
