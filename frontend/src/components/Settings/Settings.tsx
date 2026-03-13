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
import Navbar from '../Layout/Navbar';
import Preferences from './Preferences';
import PrivacySettings from './PrivacySettings';
import ProfileSettings from './ProfileSettings';

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

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    setPrivacyState(privacy);
  }, [privacy]);

  useEffect(() => {
    setPreferencesState(preferences);
  }, [preferences]);

  useEffect(() => {
    setProfileState(profile);
  }, [profile]);

  useEffect(() => {
    applyTheme(preferencesState.theme);
  }, [preferencesState.theme]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(clearUpdateSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, updateSuccess]);

  const hasUnsavedChanges = useMemo(() => {
    const privacyChanged = JSON.stringify(privacyState) !== JSON.stringify(privacy);
    const preferencesChanged = JSON.stringify(preferencesState) !== JSON.stringify(preferences);
    const profileChanged = JSON.stringify(profileState) !== JSON.stringify(profile);
    return privacyChanged || preferencesChanged || profileChanged;
  }, [privacy, privacyState, preferences, preferencesState, profile, profileState]);

  const validateProfile = (): string | null => {
    if (!profileState.username.trim()) {
      return 'Username is required.';
    }

    if (profileState.username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }

    if (!profileState.email.trim()) {
      return 'Email is required.';
    }

    if (!isValidEmail(profileState.email)) {
      return 'Please enter a valid email address.';
    }

    if (profileState.bio.trim().length > 500) {
      return 'Bio must be 500 characters or less.';
    }

    return null;
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) {
      return;
    }

    const validationError = validateProfile();
    if (validationError) {
      setProfileFormError(validationError);
      return;
    }

    setProfileFormError(null);
    dispatch(clearSettingsError());
    dispatch(
      updateSettings({
        privacy: privacyState,
        preferences: preferencesState,
        profile: profileState,
      })
    );
  };

  const handleReset = () => {
    setPrivacyState(privacy);
    setPreferencesState(preferences);
    setProfileState(profile);
    setProfileFormError(null);
    dispatch(clearSettingsError());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-4 sm:px-8 py-8 pt-24">
        <section className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">Account</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your profile, privacy, and preferences.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasUnsavedChanges && <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">Unsaved changes</span>}
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasUnsavedChanges || loading}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || loading}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {error && <div className="mb-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
        {profileFormError && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
            {profileFormError}
          </div>
        )}

        {updateSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Settings saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <ProfileSettings
              value={profileState}
              onChange={(next) => {
                setProfileFormError(null);
                setProfileState(next);
              }}
            />
            <PrivacySettings value={privacyState} onChange={setPrivacyState} />
            <Preferences value={preferencesState} onChange={setPreferencesState} />
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm h-fit xl:sticky xl:top-28">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Public Profile Preview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">What your community can view.</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Username</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{profileState.username || 'Not set'}</p>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Visibility</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{privacyState.showActivity}</p>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Theme</p>
                <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-white">{preferencesState.theme}</p>
              </div>
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3">
                <p className="font-semibold text-amber-800 dark:text-amber-400">Visibility reminder</p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Leaderboard and achievements can be hidden based on privacy settings.</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || loading}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
          >
            {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
