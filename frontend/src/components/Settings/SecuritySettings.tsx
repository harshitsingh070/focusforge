import React from 'react';

const SecuritySettings: React.FC = () => (
  <section className="card">
    <h2 className="font-display text-xl font-bold text-gray-900">Security</h2>
    <p className="mt-1 text-sm text-ink-muted">Password reset/change endpoints are not currently exposed by backend.</p>

    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm text-amber-800">
        Backend is configured for JWT auth login/signup only. Add password-change/reset API routes to enable full
        security controls in this section.
      </p>
    </div>
  </section>
);

export default SecuritySettings;
