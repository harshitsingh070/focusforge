import React from 'react';
import { ProfileSettingsData } from '../../types';

interface ProfileSettingsProps {
  value: ProfileSettingsData;
  onChange: (value: ProfileSettingsData) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ value, onChange }) => (
  <section className="card">
    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Profile</h2>
    <p className="mt-1 text-sm text-slate-500">Manage your public identity and intro.</p>

    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="md:col-span-1">
        <label htmlFor="profile-username" className="mb-1 block text-sm font-semibold text-gray-700">
          Username
        </label>
        <input
          id="profile-username"
          type="text"
          className="input-field"
          value={value.username}
          onChange={(event) => onChange({ ...value, username: event.target.value })}
        />
      </div>

      <div className="md:col-span-1">
        <label htmlFor="profile-email" className="mb-1 block text-sm font-semibold text-gray-700">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          className="input-field"
          value={value.email}
          onChange={(event) => onChange({ ...value, email: event.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="profile-bio" className="mb-1 block text-sm font-semibold text-gray-700">
          Bio
        </label>
        <textarea
          id="profile-bio"
          className="textarea-field"
          rows={3}
          value={value.bio}
          onChange={(event) => onChange({ ...value, bio: event.target.value })}
          placeholder="Share what you are currently building."
        />
      </div>
    </div>
  </section>
);

export default ProfileSettings;
