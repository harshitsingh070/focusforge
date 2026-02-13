import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type BadgeRule = {
    name: string;
    criteria: string;
    threshold: string;
    scope: string;
    bonusPoints: number;
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

const PlatformRules: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to={isAuthenticated ? '/dashboard' : '/login'} className="text-2xl font-bold text-primary-600">
                        FocusForge
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link to="/rules" className="text-primary-600 font-semibold">Platform Rules</Link>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">Login</Link>
                                <Link to="/register" className="text-gray-700 hover:text-primary-600 font-medium">Register</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FocusForge Platform Rules</h1>
                    <p className="text-gray-600">
                        Complete rulebook for scoring, leaderboards, activity logging, badges, privacy, and trust.
                    </p>
                </div>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1) Account and Access Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Username is required and must be between 3 and 50 characters.</li>
                        <li>Email is required and must be valid.</li>
                        <li>Password is required and must be at least 6 characters.</li>
                        <li>Email and username must be unique.</li>
                        <li>Most API routes require authentication; auth and debug routes are public.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2) Goal Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Category is required and must be one of the platform categories.</li>
                        <li>Title is required (max 255 chars) and description is optional (max 1000 chars).</li>
                        <li>Difficulty must be between 1 and 5.</li>
                        <li>Daily minimum minutes must be between 10 and 600.</li>
                        <li>Start date is required. End date is optional, but cannot be before start date.</li>
                        <li>Goals are private by default unless set public.</li>
                        <li>Deleting a goal deactivates it; activity cannot be logged on inactive goals.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3) Activity Logging Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Activity can only be logged on your own goal.</li>
                        <li>One activity per user + goal + date (duplicate logs for same day are blocked).</li>
                        <li>Minutes per log must be between 10 and 600.</li>
                        <li>Log date cannot be in the future.</li>
                        <li>Log date cannot be older than 30 days from today.</li>
                        <li>Log date must be within the goal start/end date range.</li>
                        <li>Daily total minutes above anti-cheat limits are rejected.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4) Point Scoring Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Base points = round(10 * difficulty multiplier).</li>
                        <li>Difficulty multiplier: difficulty 1-2 = 1.0, 3-4 = 1.5, 5 = 2.0.</li>
                        <li>Time bonus = floor(max(0, minutesSpent - 20) / 10).</li>
                        <li>Streak bonus = min(max(currentStreak, 0), 21) * 2.</li>
                        <li>Raw activity points = base points + time bonus + streak bonus.</li>
                        <li>Diminishing multiplier: if similar duration (+/-10 min) repeats for 4+ consecutive days on same goal, multiplier becomes 0.8; otherwise 1.0.</li>
                        <li>Adjusted points = floor(raw activity points * diminishing multiplier).</li>
                        <li>Daily activity point cap = 100; awarded points cannot exceed remaining daily cap.</li>
                        <li>Weekly consistency bonus: +50 once per week if active on at least 5 distinct days in that week.</li>
                        <li>Point ledger stores only non-negative points.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">5) Streak Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>A day counts toward a goal streak only if logged minutes meet that goal&apos;s daily minimum.</li>
                        <li>Current streak is based on consecutive qualified days and resets if continuity breaks.</li>
                        <li>If latest qualifying activity is older than yesterday, current streak becomes 0.</li>
                        <li>Longest streak records your best consecutive qualified run.</li>
                        <li>Streak is considered at risk after 1+ day without activity.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">6) Leaderboard Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Periods: WEEKLY, MONTHLY, ALL_TIME.</li>
                        <li>Current period windows use: today-7 days (weekly), today-30 days (monthly), and from 2020-01-01 (all time).</li>
                        <li>Only users with public, active goals and activity in the selected period are ranked.</li>
                        <li>Category leaderboard only includes activity from public goals in that category.</li>
                        <li>If privacy setting showLeaderboard is false, user is excluded from leaderboard.</li>
                        <li>Leaderboard score is normalized and weighted: Points 40%, Streak 30%, Consistency (days active) 30%.</li>
                        <li>When snapshot data is missing or invalid, leaderboard falls back to on-demand computation.</li>
                        <li>Frontend leaderboard auto-refreshes every 30 seconds.</li>
                    </ul>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">7) Badge Rules</h2>
                    <p className="text-sm text-gray-700 mb-3">
                        Badge engine evaluates unearned badges after activity logging. Criteria types include POINTS, STREAK, CONSISTENCY, and DAYS_ACTIVE. A badge can grant bonus points when earned.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Badge</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Criteria</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Threshold</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Scope</th>
                                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Bonus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {defaultBadgeRules.map((badge) => (
                                    <tr key={badge.name}>
                                        <td className="px-3 py-2 text-gray-800">{badge.name}</td>
                                        <td className="px-3 py-2 text-gray-700">{badge.criteria}</td>
                                        <td className="px-3 py-2 text-gray-700">{badge.threshold}</td>
                                        <td className="px-3 py-2 text-gray-700">{badge.scope}</td>
                                        <td className="px-3 py-2 text-right text-gray-700">{badge.bonusPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">8) Anti-Cheat and Trust Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Entries above per-entry limit or daily total limit fail validation.</li>
                        <li>If Redis is enabled, rate limit applies: max 10 log attempts per hour.</li>
                        <li>Repeated identical-minute patterns can be flagged as suspicious.</li>
                        <li>Suspicious events lower trust score and can trigger trust alerts.</li>
                        <li>Trust score starts at 100 and is reduced by recent suspicious signals (last 30 days).</li>
                        <li>Trust bands: HIGH (&gt;=85), MEDIUM (&gt;=65), LOW (&lt;65).</li>
                    </ul>
                </section>

                <section className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">9) Notification Rules</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                        <li>Daily reminder is generated if you have no activity today.</li>
                        <li>Streak risk notification is generated if you have an active streak but no activity today.</li>
                        <li>Weekly summary notification includes points, minutes, and active days.</li>
                        <li>Badge earned and trust alert notifications are auto-generated when applicable.</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default PlatformRules;
