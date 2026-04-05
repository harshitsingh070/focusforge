import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminAPI } from '../../services/api';

interface SummaryData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersLast30Days: number;
  totalGoals: number;
  activeGoals: number;
  publicActiveGoals: number;
  totalActivities: number;
  activitiesLast24Hours: number;
  activitiesLast7Days: number;
  uniqueUsersLast7Days: number;
  totalMinutesLogged: number;
  totalPointEntries: number;
  totalPointsAwarded: number;
}

interface TrafficRow {
  date: string;
  activities: number;
  activeUsers: number;
  minutes: number;
  points: number;
}

interface TopUserRow {
  rank: number;
  userId: number;
  username: string;
  email: string;
  totalPoints: number;
  totalMinutes: number;
  totalActivities: number;
  activeGoalsCount: number;
}

interface AdminUserRow {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string | null;
  privacySettings: string | null;
  goalsCount: number;
  activeGoalsCount: number;
  totalActivities: number;
  totalMinutes: number;
  totalPoints: number;
  pointsLast7Days: number;
  lastActivityDate: string | null;
}

interface RecentActivityRow {
  id: number;
  username: string;
  email: string;
  goalTitle: string;
  category: string;
  logDate: string;
  minutesSpent: number;
}

interface FunnelStageRow {
  stage: string;
  users: number;
  conversionFromPrevious: number;
  dropOffFromPrevious: number;
}

interface RetentionOverallRow {
  day1Rate: number;
  day7Rate: number;
  day30Rate: number;
  eligibleDay1Users: number;
  eligibleDay7Users: number;
  eligibleDay30Users: number;
}

interface RetentionCohortRow {
  cohortStart: string;
  users: number;
  day1Rate: number;
  day7Rate: number;
  day30Rate: number;
}

interface RetentionMetricsData {
  overall: RetentionOverallRow;
  cohorts: RetentionCohortRow[];
}

interface LifecycleStateRow {
  state: string;
  users: number;
  percentage: number;
}

interface FeatureUsageRow {
  feature: string;
  users: number;
  adoptionRate: number;
  totalEvents: number;
  eventsLast7Days: number;
  avgEventsPerActiveUser: number;
}

interface FunnelDropOffRow {
  fromStage: string;
  toStage: string;
  usersLost: number;
  dropOffRate: number;
}

interface InactivityBucketRow {
  bucket: string;
  users: number;
}

interface DropOffAnalyticsData {
  usersWithoutGoals: number;
  usersWithGoalsNoActivity: number;
  abandonedActiveGoals: number;
  funnelDropOff: FunnelDropOffRow[];
  largestDropOff: FunnelDropOffRow | null;
  inactivityBuckets: InactivityBucketRow[];
}

interface AdminOverviewResponse {
  generatedAt: string;
  adminEmail: string;
  summary: SummaryData;
  traffic: TrafficRow[];
  topUsers: TopUserRow[];
  users: AdminUserRow[];
  recentActivity: RecentActivityRow[];
  funnelTracking: FunnelStageRow[];
  retentionMetrics: RetentionMetricsData;
  userLifecycleStates: LifecycleStateRow[];
  featureUsageTracking: FeatureUsageRow[];
  dropOffAnalytics: DropOffAnalyticsData;
}

const CHART_COLORS = ['#0f766e', '#ea580c', '#2563eb', '#16a34a', '#be185d', '#0ea5e9'];
const chartGridStroke = '#dfe9e6';
const axisStroke = '#5f7773';

const formatShortDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatPercent = (value: number | null | undefined): string => `${(value ?? 0).toFixed(1)}%`;

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async (manualRefresh = false) => {
    if (manualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await adminAPI.getOverview();
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      if (manualRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadOverview(false);
  }, [loadOverview]);

  const trafficChartData = useMemo(
    () =>
      (data?.traffic || []).map((row) => ({
        ...row,
        label: formatShortDate(row.date),
      })),
    [data]
  );

  const topUsersChartData = useMemo(
    () =>
      (data?.topUsers || []).slice(0, 8).map((row) => ({
        ...row,
        shortName: row.username.length > 12 ? `${row.username.slice(0, 12)}...` : row.username,
      })),
    [data]
  );

  const topUsersDetails = useMemo(() => {
    if (!data) {
      return [];
    }

    const usersById = new Map<number, AdminUserRow>();
    data.users.forEach((user) => {
      usersById.set(user.userId, user);
    });

    return data.topUsers.slice(0, 15).map((topUser) => {
      const userDetail = usersById.get(topUser.userId);
      return {
        ...topUser,
        pointsLast7Days: userDetail?.pointsLast7Days ?? 0,
        goalsCount: userDetail?.goalsCount ?? topUser.activeGoalsCount,
        lastActivityDate: userDetail?.lastActivityDate ?? null,
        createdAt: userDetail?.createdAt ?? null,
        isActive: userDetail?.isActive ?? true,
      };
    });
  }, [data]);

  const userStatusData = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      { name: 'Active', value: data.summary.activeUsers },
      { name: 'Inactive', value: data.summary.inactiveUsers },
    ].filter((entry) => entry.value > 0);
  }, [data]);

  const categoryBreakdownData = useMemo(() => {
    const categoryMap = new Map<string, { activities: number; minutes: number }>();

    (data?.recentActivity || []).forEach((entry) => {
      const key = entry.category?.trim() || 'Uncategorized';
      const current = categoryMap.get(key) || { activities: 0, minutes: 0 };
      categoryMap.set(key, {
        activities: current.activities + 1,
        minutes: current.minutes + (entry.minutesSpent || 0),
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, values]) => ({ category, ...values }))
      .sort((left, right) => right.activities - left.activities)
      .slice(0, 8);
  }, [data]);

  const funnelChartData = useMemo(
    () =>
      (data?.funnelTracking || []).map((row) => ({
        ...row,
        shortStage: row.stage.length > 22 ? `${row.stage.slice(0, 22)}...` : row.stage,
      })),
    [data]
  );

  const lifecycleChartData = useMemo(
    () =>
      (data?.userLifecycleStates || []).map((row) => ({
        ...row,
        label: row.state.length > 14 ? `${row.state.slice(0, 14)}...` : row.state,
      })),
    [data]
  );

  const featureUsageData = useMemo(() => data?.featureUsageTracking || [], [data]);
  const inactivityBucketData = useMemo(() => data?.dropOffAnalytics?.inactivityBuckets || [], [data]);
  const retentionOverall = data?.retentionMetrics?.overall;
  const retentionCohorts = data?.retentionMetrics?.cohorts || [];

  const renderHeader = (title: string, subtitle?: string, adminEmail?: string) => (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 pb-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">{title}</h1>
          {subtitle && <p className="text-base text-slate-500 dark:text-slate-400">{subtitle}</p>}
          {adminEmail && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Admin: {adminEmail}</p>}
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="page-shell">
        {renderHeader('Discipify Admin', 'Traffic and system insights')}
        <div className="flex h-96 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-violet-600 dark:border-violet-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        {renderHeader('Discipify Admin', 'Traffic and system insights')}
        <main className="page-container max-w-4xl">
          <div className="card border-red-200/50 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Admin dashboard unavailable</h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error || 'No data available.'}</p>
            <button onClick={() => loadOverview(false)} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {renderHeader('Discipify Admin Dashboard', 'Traffic and Platform Details', data.adminEmail)}

      <main className="page-container">
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-block rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-3">Operations View</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Admin-only analytics across users, activity flow, and points.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => loadOverview(true)} className="btn-primary" disabled={refreshing}>
              {refreshing ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Refresh Data
                </span>
              )}
            </button>
            {data.generatedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last updated: {new Date(data.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200/50 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
            <p className="mt-2 text-3xl font-black text-violet-700 dark:text-violet-400">
              {data.summary.totalUsers.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {data.summary.activeUsers.toLocaleString()} active / {data.summary.inactiveUsers.toLocaleString()}{' '}
              inactive
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Activities</p>
            <p className="mt-2 text-3xl font-black text-orange-600 dark:text-orange-400">
              {data.summary.totalActivities.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {data.summary.activitiesLast24Hours.toLocaleString()} in last 24h
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Points Awarded</p>
            <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {data.summary.totalPointsAwarded.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {data.summary.totalPointEntries.toLocaleString()} ledger entries
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Goals</p>
            <p className="mt-2 text-3xl font-black text-sky-700 dark:text-sky-400">
              {data.summary.activeGoals.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {data.summary.publicActiveGoals.toLocaleString()} public goals
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Traffic (7 Days)</p>
            <p className="mt-2 text-3xl font-black text-violet-700 dark:text-violet-400">
              {data.summary.activitiesLast7Days.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {data.summary.uniqueUsersLast7Days.toLocaleString()} unique active users
            </p>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Retention D1</p>
            <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-400">{formatPercent(retentionOverall?.day1Rate)}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {(retentionOverall?.eligibleDay1Users ?? 0).toLocaleString()} eligible users
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Retention D7</p>
            <p className="mt-2 text-3xl font-black text-teal-700 dark:text-teal-400">{formatPercent(retentionOverall?.day7Rate)}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {(retentionOverall?.eligibleDay7Users ?? 0).toLocaleString()} eligible users
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Retention D30</p>
            <p className="mt-2 text-3xl font-black text-cyan-700 dark:text-cyan-400">{formatPercent(retentionOverall?.day30Rate)}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {(retentionOverall?.eligibleDay30Users ?? 0).toLocaleString()} eligible users
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Users Without Goals</p>
            <p className="mt-2 text-3xl font-black text-amber-700 dark:text-amber-400">
              {(data?.dropOffAnalytics?.usersWithoutGoals ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Primary onboarding drop-off bucket</p>
          </article>

          <article className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Abandoned Active Goals</p>
            <p className="mt-2 text-3xl font-black text-rose-700 dark:text-rose-400">
              {(data?.dropOffAnalytics?.abandonedActiveGoals ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">No activity in the last 14 days</p>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Funnel Tracking</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Live conversion across activation milestones.</p>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="shortStage" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis tick={{ fill: axisStroke, fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#0f766e" name="Users" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">User Lifecycle States</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Current distribution across lifecycle health buckets.</p>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={lifecycleChartData} dataKey="users" nameKey="state" outerRadius={100} label>
                    {lifecycleChartData.map((entry, index) => (
                      <Cell key={`${entry.state}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Traffic Trend (14 Days)</h2>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="label" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="activities"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    dot={false}
                    name="Activities"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Points and Minutes Output</h2>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="label" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="points" fill="#16a34a" name="Points" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="minutes" fill="#ea580c" name="Minutes" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="card xl:col-span-2">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Top Contributors</h2>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUsersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="shortName" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis tick={{ fill: axisStroke, fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPoints" fill="#0f766e" name="Points" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalActivities" fill="#2563eb" name="Activities" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">User Status</h2>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userStatusData} dataKey="value" nameKey="name" outerRadius={95} label>
                    {userStatusData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Top Users Detail</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Expanded ranking breakdown for the top contributors.</p>
          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="data-table min-w-[1100px]">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Status</th>
                  <th className="text-right">Points</th>
                  <th className="text-right">Points (7d)</th>
                  <th className="text-right">Activities</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Pts / Activity</th>
                  <th className="text-right">Goals</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {topUsersDetails.map((user) => (
                  <tr key={`top-user-detail-${user.userId}`}>
                    <td className="font-semibold text-slate-900 dark:text-white">#{user.rank}</td>
                    <td>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                    </td>
                    <td>
                      <span className={`status-chip ${user.isActive ? '' : 'danger'}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="text-right">{user.totalPoints.toLocaleString()}</td>
                    <td className="text-right">{user.pointsLast7Days.toLocaleString()}</td>
                    <td className="text-right">{user.totalActivities.toLocaleString()}</td>
                    <td className="text-right">{user.totalMinutes.toLocaleString()}</td>
                    <td className="text-right">
                      {(user.totalActivities > 0 ? user.totalPoints / user.totalActivities : 0).toFixed(1)}
                    </td>
                    <td className="text-right">
                      {user.activeGoalsCount.toLocaleString()} / {user.goalsCount.toLocaleString()}
                    </td>
                    <td>{user.lastActivityDate || '-'}</td>
                  </tr>
                ))}
                {topUsersDetails.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-600 dark:text-slate-400">
                      No top-user details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Feature Usage Tracking</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Real usage and adoption levels for core product features.</p>
          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="data-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="text-right">Users</th>
                  <th className="text-right">Adoption</th>
                  <th className="text-right">Total Events</th>
                  <th className="text-right">Events (7d)</th>
                  <th className="text-right">Avg / Active User</th>
                </tr>
              </thead>
              <tbody>
                {featureUsageData.map((item) => (
                  <tr key={item.feature}>
                    <td className="font-semibold text-slate-900 dark:text-white">{item.feature}</td>
                    <td className="text-right">{item.users.toLocaleString()}</td>
                    <td className="text-right">{formatPercent(item.adoptionRate)}</td>
                    <td className="text-right">{item.totalEvents.toLocaleString()}</td>
                    <td className="text-right">{item.eventsLast7Days.toLocaleString()}</td>
                    <td className="text-right">{item.avgEventsPerActiveUser.toFixed(2)}</td>
                  </tr>
                ))}
                {featureUsageData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-600 dark:text-slate-400">
                      No feature usage data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Retention Cohorts</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Rolling retention rates by signup week cohort.</p>
            <div className="scrollbar-soft mt-4 overflow-x-auto">
              <table className="data-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Cohort Week</th>
                    <th className="text-right">Users</th>
                    <th className="text-right">D1</th>
                    <th className="text-right">D7</th>
                    <th className="text-right">D30</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionCohorts.map((row) => (
                    <tr key={row.cohortStart}>
                      <td>{row.cohortStart}</td>
                      <td className="text-right">{row.users.toLocaleString()}</td>
                      <td className="text-right">{formatPercent(row.day1Rate)}</td>
                      <td className="text-right">{formatPercent(row.day7Rate)}</td>
                      <td className="text-right">{formatPercent(row.day30Rate)}</td>
                    </tr>
                  ))}
                  {retentionCohorts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-600 dark:text-slate-400">
                        No retention cohort rows available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Drop-off Analytics</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Where users and goals are currently dropping off.</p>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Users with goals but no activity:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {(data?.dropOffAnalytics?.usersWithGoalsNoActivity ?? 0).toLocaleString()}
                </span>
              </p>
              {data?.dropOffAnalytics?.largestDropOff && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Largest stage drop: <span className="font-semibold text-slate-900 dark:text-white">
                    {data.dropOffAnalytics.largestDropOff.fromStage}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {data.dropOffAnalytics.largestDropOff.toStage}
                  </span>{' '}
                  ({formatPercent(data.dropOffAnalytics.largestDropOff.dropOffRate)} drop)
                </p>
              )}
            </div>
            <div className="mt-4 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inactivityBucketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="bucket" tick={{ fill: axisStroke, fontSize: 11 }} />
                  <YAxis tick={{ fill: axisStroke, fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#ea580c" name="Users" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="scrollbar-soft mt-4 overflow-x-auto">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>From Stage</th>
                    <th>To Stage</th>
                    <th className="text-right">Users Lost</th>
                    <th className="text-right">Drop-off</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.dropOffAnalytics?.funnelDropOff ?? []).map((row) => (
                    <tr key={`${row.fromStage}-${row.toStage}`}>
                      <td>{row.fromStage}</td>
                      <td>{row.toStage}</td>
                      <td className="text-right">{row.usersLost.toLocaleString()}</td>
                      <td className="text-right">{formatPercent(row.dropOffRate)}</td>
                    </tr>
                  ))}
                  {(!data?.dropOffAnalytics?.funnelDropOff || data.dropOffAnalytics.funnelDropOff.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center text-slate-600 dark:text-slate-400">
                        No funnel drop-off rows available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Category Mix (Recent Activity Logs)</h2>
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                <XAxis dataKey="category" tick={{ fill: axisStroke, fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: axisStroke, fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: axisStroke, fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="activities"
                  fill="#0ea5e9"
                  name="Activity Count"
                  radius={[6, 6, 0, 0]}
                />
                <Bar yAxisId="right" dataKey="minutes" fill="#ea580c" name="Minutes" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Traffic Detail (Last 14 Days)</h2>
          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-right">Activities</th>
                  <th className="text-right">Active Users</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.traffic.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td className="text-right">{row.activities.toLocaleString()}</td>
                    <td className="text-right">{row.activeUsers.toLocaleString()}</td>
                    <td className="text-right">{row.minutes.toLocaleString()}</td>
                    <td className="text-right">{row.points.toLocaleString()}</td>
                  </tr>
                ))}
                {data.traffic.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-600 dark:text-slate-400">
                      No traffic rows available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">All Users</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Detailed user-level metrics and account status.</p>
          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="data-table min-w-[1000px]">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th className="text-right">Points</th>
                  <th className="text-right">Points (7d)</th>
                  <th className="text-right">Activities</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Goals</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <p className="font-semibold text-slate-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                    </td>
                    <td>
                      <span className={`status-chip ${user.isActive ? '' : 'danger'}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="text-right">{user.totalPoints.toLocaleString()}</td>
                    <td className="text-right">{user.pointsLast7Days.toLocaleString()}</td>
                    <td className="text-right">{user.totalActivities.toLocaleString()}</td>
                    <td className="text-right">{user.totalMinutes.toLocaleString()}</td>
                    <td className="text-right">
                      {user.activeGoalsCount.toLocaleString()} / {user.goalsCount.toLocaleString()}
                    </td>
                    <td>{user.lastActivityDate || '-'}</td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-600 dark:text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Recent Activity Logs</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Latest 100 activity logs across the platform.</p>
          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="data-table min-w-[880px]">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Goal</th>
                  <th>Category</th>
                  <th className="text-right">Minutes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.username}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.email}</p>
                    </td>
                    <td>{item.goalTitle}</td>
                    <td>{item.category}</td>
                    <td className="text-right">{item.minutesSpent.toLocaleString()}</td>
                    <td>{item.logDate}</td>
                  </tr>
                ))}
                {data.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-600 dark:text-slate-400">
                      No activity data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
