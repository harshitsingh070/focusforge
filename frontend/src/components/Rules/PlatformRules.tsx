import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  iconBg: string;
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
    title: 'Account & Access',
    icon: 'person',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
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
    icon: 'track_changes',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
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
    title: 'Activity Logging',
    icon: 'event_note',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
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
    title: 'Point Scoring',
    icon: 'stars',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    points: [
      'Base points use difficulty multiplier: round(10 × multiplier).',
      'Time bonus applies for minutes above 20.',
      'Streak bonus is capped and scaled by current streak.',
      'Daily activity points have a cap of 100.',
      'Weekly consistency bonus grants +50 for 5+ active days.',
    ],
  },
  {
    id: 'streaks',
    title: 'Streak Rules',
    icon: 'local_fire_department',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
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
    icon: 'leaderboard',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    points: [
      'Periods include WEEKLY, MONTHLY, and ALL_TIME.',
      'Only users with public active goals and period activity are ranked.',
      'If showLeaderboard is disabled, the user is excluded.',
      'Score weighting: Points 40%, Streak 30%, Consistency 30%.',
      'Leaderboard auto-refreshes every 30 seconds.',
    ],
  },
  {
    id: 'trust',
    title: 'Anti-Cheat & Trust',
    icon: 'verified_user',
    iconBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    points: [
      'Entries above limits fail validation.',
      'Repeated suspicious patterns can reduce trust score.',
      'Trust score starts at 100 and decays by recent risk signals.',
      'Trust bands: HIGH (85+), MEDIUM (65+), LOW (<65).',
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    points: [
      'Daily reminder appears when no activity is logged today.',
      'Streak risk alert appears for active streaks without activity.',
      'Weekly summary includes points, minutes, and active days.',
      'Badge earned and trust alerts are generated automatically.',
    ],
  },
];

const criteriaColors: Record<string, string> = {
  POINTS: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  STREAK: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  CONSISTENCY: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  DAYS_ACTIVE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

const scopeColors: Record<string, string> = {
  GLOBAL: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  PER_GOAL: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
};

const PlatformRules: React.FC = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['account']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 [font-family:'Inter',sans-serif]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 sm:px-8 py-8 pt-24">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">Platform</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">FocusForge Rules</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Transparent scoring, privacy, and trust rules for consistency-based productivity tracking.
          </p>

          {/* Quick stats bar */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: 'Rule Sections', value: ruleSections.length.toString(), icon: 'gavel' },
              { label: 'Badge Types', value: defaultBadgeRules.length.toString(), icon: 'military_tech' },
              { label: 'Score Factors', value: '3', icon: 'ssid_chart' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-violet-500">{s.icon}</span>
                <span className="font-bold text-slate-900 dark:text-white">{s.value}</span>
                <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rule Sections Accordion ── */}
        <section className="mb-8 space-y-3">
          {ruleSections.map((section, index) => {
            const isOpen = openSections.has(section.id);
            return (
              <div
                key={section.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? 'border-violet-200 dark:border-violet-800/50 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${section.iconBg}`}>
                      <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                    </div>
                    <span className="text-base font-semibold text-slate-900 dark:text-white">{section.title}</span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {section.points.length} rules
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4">
                    <ul className="space-y-2.5">
                      {section.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                            <span className="material-symbols-outlined text-[11px] text-violet-600 dark:text-violet-400">check</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* ── Badge Rules Table ── */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <span className="material-symbols-outlined text-[18px] text-amber-600 dark:text-amber-400">military_tech</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Badge Rules</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Evaluated after each activity log. Bonus points apply on unlock.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Badge</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Criteria</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Threshold</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Scope</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bonus pts</th>
                </tr>
              </thead>
              <tbody>
                {defaultBadgeRules.map((badge, i) => (
                  <tr
                    key={badge.name}
                    className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      i === defaultBadgeRules.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{badge.name}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${criteriaColors[badge.criteria] || ''}`}>
                        {badge.criteria}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{badge.threshold}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${scopeColors[badge.scope] || ''}`}>
                        {badge.scope}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-bold text-violet-600 dark:text-violet-400">+{badge.bonusPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mt-10 rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 p-8 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to start building momentum?</p>
          <p className="text-slate-500 dark:text-slate-400 mb-5">Track your goals, protect your streaks, and climb the leaderboard.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/goals')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.02] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">track_changes</span>
              View My Goals
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">leaderboard</span>
              Leaderboard
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PlatformRules;
