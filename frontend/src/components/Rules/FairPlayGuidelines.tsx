import React from 'react';

const FairPlayGuidelines: React.FC = () => (
  <section className="card mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Fair Play Guidelines</h2>
    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
      <li>Log realistic minutes per entry and per day.</li>
      <li>Avoid repetitive suspicious patterns that can reduce trust score.</li>
      <li>Only log activities you actually completed.</li>
      <li>Respect one-log-per-goal-per-day validation rules.</li>
      <li>Leaderboard eligibility depends on public goals and privacy settings.</li>
      <li>Abuse of automation or fabricated logs can trigger trust alerts.</li>
    </ul>
  </section>
);

export default FairPlayGuidelines;
