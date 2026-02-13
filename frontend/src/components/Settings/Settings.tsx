import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { clearUpdateSuccess, fetchSettings, updateSettings } from '../../store/settingsSlice';
import { PrivacySettings as PrivacySettingsType, ProfileSettingsData, UserPreferences } from '../../types';
import Navbar from '../Layout/Navbar';
import Preferences from './Preferences';
import PrivacySettings from './PrivacySettings';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { privacy, preferences, profile, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.settings
  );

  const [privacyState, setPrivacyState] = useState<PrivacySettingsType>(privacy);
  const [preferencesState, setPreferencesState] = useState<UserPreferences>(preferences);
  const [profileState, setProfileState] = useState<ProfileSettingsData>(profile);

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
    if (!updateSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(clearUpdateSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, updateSuccess]);

  const handleSave = () => {
    dispatch(
      updateSettings({
        privacy: privacyState,
        preferences: preferencesState,
        profile: profileState,
      })
    );
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-5xl">
        <section className="section-heading">
          <p className="status-chip">Account Controls</p>
          <h1 className="section-title mt-3">Settings</h1>
          <p className="section-subtitle">Manage privacy, profile, and preferences from one place.</p>
        </section>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {updateSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            Settings saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <PrivacySettings value={privacyState} onChange={setPrivacyState} />
          <Preferences value={preferencesState} onChange={setPreferencesState} />
          <ProfileSettings value={profileState} onChange={setProfileState} />
          <SecuritySettings />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </main>
    </div>
  );
};

export default Settings;
