import React from 'react';

const rows = [
  ['Base points', 'round(10 * difficulty multiplier)'],
  ['Difficulty multiplier', '1-2 => 1.0, 3-4 => 1.5, 5 => 2.0'],
  ['Time bonus', 'floor(max(0, minutesSpent - 20) / 10)'],
  ['Streak bonus', 'min(max(currentStreak, 0), 21) * 2'],
  ['Adjusted points', 'floor(raw points * diminishing multiplier)'],
  ['Daily cap', 'Max 100 activity points per day'],
  ['Weekly consistency bonus', '+50 for >=5 active days in a week'],
];

const ScoringBreakdown: React.FC = () => (
  <section className="card mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Scoring Breakdown</h2>
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Formula / Constraint</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              <td className="font-semibold text-gray-900">{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default ScoringBreakdown;
