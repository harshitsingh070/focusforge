import React from 'react';
import Navbar from '../Layout/Navbar';

type BadgeRule = {
  name: string;
  criteria: string;
  threshold: string;
  scope: string;
  bonusPoints: number;
};

type RuleSection = {
  id: string;
  title: string;
  icon: string;
  points: string[];
};

const defaultBadgeRules: BadgeRule[] = [
  { name: 'First Steps', criteria: 'POINTS', threshold: '10 points', scope: 'GLOBAL', bonusPoints: 5 },
  { name: 'Rising Star', criteria: 'POINTS', threshold: '50 points', scope: 'GLOBAL', bonusPoints: 10 },
  { name: 'Century Club', criteria: 'POINTS', threshold: '100 points', scope: 'GLOBAL', bonusPoints: 25 },
  { name: 'Points Master', criteria: 'POINTS', threshold: '500 points', scope: 'GLOBAL', bonusPoints: 100 },
  { name: 'Millennium Master', criteria: 'POINTS', threshold: '1000 points', scope: 'GLOBAL', bonusPoints: 250 },
  { name: 'Three Day Fire', criteria: 'STREAK', threshold: '3 day streak', scope: 'PER_GOAL', bonusPoints: 10 },
  { name: 'Week Warrior', criteria: 'STREAK', threshold: '7 day streak', scope: 'PER_GOAL', bonusPoints: 25 },
  { name: 'Two Week Titan', criteria: 'STREAK', threshold: '14 day streak', scope: 'PER_GOAL', bonusPoints: 50 },
  { name: 'Month Master', criteria: 'STREAK', threshold: '30 day streak', scope: 'PER_GOAL', bonusPoints: 100 },
  { name: 'Dedication', criteria: 'CONSISTENCY', threshold: '7 consecutive days', scope: 'GLOBAL', bonusPoints: 20 },
  { name: 'Persistence', criteria: 'CONSISTENCY', threshold: '14 consecutive days', scope: 'GLOBAL', bonusPoints: 40 },
  { name: 'Consistency King', criteria: 'CONSISTENCY', threshold: '30 consecutive days', scope: 'GLOBAL', bonusPoints: 100 },
  { name: 'Getting Started', criteria: 'DAYS_ACTIVE', threshold: '5 active days', scope: 'GLOBAL', bonusPoints: 10 },
  { name: 'Committed', criteria: 'DAYS_ACTIVE', threshold: '15 active days', scope: 'GLOBAL', bonusPoints: 30 },
  { name: '30 Day Challenge', criteria: 'DAYS_ACTIVE', threshold: '30 active days', scope: 'GLOBAL', bonusPoints: 75 },
  { name: '100 Day Club', criteria: 'DAYS_ACTIVE', threshold: '100 active days', scope: 'GLOBAL', bonusPoints: 200 },
];

const ruleSections: RuleSection[] = [
  {
    id: 'account',
    title: 'Account and Access Rules',
    icon: 'AC',
    points: [
      'Username is required and must be between 3 and 50 characters.',
      'Email is required, unique, and must be valid.',
      'Password is required and must be at least 6 characters.',
      'Most API routes require authentication.',
    ],
  },
  {
    id: 'goals',
    title: 'Goal Rules',
    icon: 'GL',
    points: [
      'Category and title are required; description is optional.',
      'Difficulty must be between 1 and 5.',
      'Daily minimum minutes must be between 10 and 600.',
      'Start date is required and end date cannot be before start date.',
      'Deleting a goal deactivates it.',
    ],
  },
  {
    id: 'activity',
    title: 'Activity Logging Rules',
    icon: 'LG',
    points: [
      'Activity can only be logged on your own goal.',
      'One activity per user + goal + date.',
      'Minutes per log must be between 10 and 600.',
      'Log date cannot be in the future or older than 30 days.',
      'Log date must be within the goal date range.',
    ],
  },
  {
    id: 'scoring',
    title: 'Point Scoring Rules',
    icon: 'PT',
    points: [
      'Base points use difficulty multiplier and round(10 * multiplier).',
      'Time bonus applies for minutes above 20.',
      'Streak bonus is capped and scaled by current streak.',
      'Daily activity points have a cap of 100.',
      'Weekly consistency bonus grants +50 for 5+ active days.',
    ],
  },
  {
    id: 'streaks',
    title: 'Streak Rules',
    icon: 'SK',
    points: [
      'A day counts only if logged minutes meet daily minimum.',
      'Current streak resets if continuity breaks.',
      'Longest streak tracks your all-time best run.',
      'Streak risk starts after 1+ day without activity.',
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard Rules',
    icon: 'LB',
    points: [
      'Periods include WEEKLY, MONTHLY, and ALL_TIME.',
      'Only users with public active goals and period activity are ranked.',
      'If showLeaderboard is disabled, the user is excluded.',
      'Score weighting is Points 40%, Streak 30%, Consistency 30%.',
      'Leaderboard auto-refreshes every 30 seconds.',
    ],
  },
  {
    id: 'trust',
    title: 'Anti-Cheat and Trust Rules',
    icon: 'TR',
    points: [
      'Entries above limits fail validation.',
      'Repeated suspicious patterns can reduce trust score.',
      'Trust score starts at 100 and decays by recent risk signals.',
      'Trust bands are HIGH (85+), MEDIUM (65+), LOW (<65).',
    ],
  },
  {
    id: 'notifications',
    title: 'Notification Rules',
    icon: 'NT',
    points: [
      'Daily reminder appears when no activity is logged today.',
      'Streak risk alert appears for active streaks without activity.',
      'Weekly summary includes points, minutes, and active days.',
      'Badge earned and trust alerts are generated automatically.',
    ],
  },
];

const PlatformRules: React.FC = () => {
  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <h1 className="section-title">FocusForge Rules</h1>
          <p className="section-subtitle">
            Transparent scoring, privacy, and trust rules for consistency-based productivity tracking.
          </p>
        </section>

        <div className="space-y-3">
          {ruleSections.map((section, index) => (
            <details key={section.id} className="ff-accordion" open={index === 0}>
              <summary>
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </summary>
              <div className="ff-accordion__content">
                <ul className="list-disc space-y-1.5 pl-4">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>

        <section className="card mt-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Badge Rules</h2>
          <p className="mt-2 text-sm text-slate-500">
            Badge engine evaluates unearned badges after each activity log and may apply bonus points.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Badge</th>
                  <th>Criteria</th>
                  <th>Threshold</th>
                  <th>Scope</th>
                  <th className="text-right">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {defaultBadgeRules.map((badge) => (
                  <tr key={badge.name}>
                    <td>{badge.name}</td>
                    <td>{badge.criteria}</td>
                    <td>{badge.threshold}</td>
                    <td>{badge.scope}</td>
                    <td className="text-right">{badge.bonusPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PlatformRules;
