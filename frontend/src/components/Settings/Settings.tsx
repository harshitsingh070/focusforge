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
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-5xl">
        <section className="section-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="status-chip">Account Controls</p>
              <h1 className="section-title mt-3">Settings</h1>
              <p className="section-subtitle">Manage privacy, profile, and preferences from one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasUnsavedChanges && <span className="status-chip warn">Unsaved changes</span>}
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasUnsavedChanges || loading}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || loading}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {profileFormError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {profileFormError}
          </div>
        )}

        {updateSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            Settings saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
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

          <aside className="card h-fit">
            <h2 className="font-display text-xl font-bold text-gray-900">Preview</h2>
            <p className="mt-1 text-sm text-ink-muted">Quick summary of what will be shown to others.</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Username</p>
                <p className="mt-1 font-semibold text-gray-900">{profileState.username || 'Not set'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Visibility</p>
                <p className="mt-1 font-semibold text-gray-900">{privacyState.showActivity}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Theme</p>
                <p className="mt-1 font-semibold capitalize text-gray-900">{preferencesState.theme}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <p className="font-semibold">Visibility reminder</p>
                <p className="mt-1 text-xs">Leaderboard, badges, and progress visibility are controlled below.</p>
              </div>
            </div>
          </aside>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || loading}
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Settings' : 'No Changes to Save'}
        </button>
      </main>
    </div>
  );
};

export default Settings;
