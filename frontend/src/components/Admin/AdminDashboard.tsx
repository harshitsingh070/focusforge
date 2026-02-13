import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
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

interface AdminOverviewResponse {
  generatedAt: string;
  adminEmail: string;
  summary: SummaryData;
  traffic: TrafficRow[];
  topUsers: TopUserRow[];
  users: AdminUserRow[];
  recentActivity: RecentActivityRow[];
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

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

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

  const renderHeader = (title: string, subtitle?: string) => (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadOverview(true)} className="btn-secondary px-3 py-2" disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={handleLogout} className="btn-secondary px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="page-shell">
        {renderHeader('FocusForge Admin', 'Traffic and system insights')}
        <div className="flex h-96 items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        {renderHeader('FocusForge Admin', 'Traffic and system insights')}
        <main className="page-container max-w-4xl">
          <div className="card border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-700">Admin dashboard unavailable</h2>
            <p className="mt-2 text-sm text-red-600">{error || 'No data available.'}</p>
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
      {renderHeader('FocusForge Admin Dashboard', `Admin account: ${data.adminEmail}`)}

      <main className="page-container">
        <section className="section-heading">
          <p className="status-chip">Operations View</p>
          <h1 className="section-title mt-3">Traffic and Platform Details</h1>
          <p className="section-subtitle">Admin-only analytics across users, activity flow, and points.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => loadOverview(true)} className="btn-primary" disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
            {data.generatedAt && (
              <p className="text-xs text-ink-muted">
                Last updated: {new Date(data.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">{error}</p>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="card">
            <p className="text-sm text-ink-muted">Total Users</p>
            <p className="mt-2 text-3xl font-black text-primary-700">
              {data.summary.totalUsers.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.activeUsers.toLocaleString()} active / {data.summary.inactiveUsers.toLocaleString()}{' '}
              inactive
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-ink-muted">Total Activities</p>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {data.summary.totalActivities.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.activitiesLast24Hours.toLocaleString()} in last 24h
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-ink-muted">Points Awarded</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {data.summary.totalPointsAwarded.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.totalPointEntries.toLocaleString()} ledger entries
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-ink-muted">Active Goals</p>
            <p className="mt-2 text-3xl font-black text-sky-700">
              {data.summary.activeGoals.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.publicActiveGoals.toLocaleString()} public goals
            </p>
          </article>

          <article className="card">
            <p className="text-sm text-ink-muted">Traffic (7 Days)</p>
            <p className="mt-2 text-3xl font-black text-violet-700">
              {data.summary.activitiesLast7Days.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {data.summary.uniqueUsersLast7Days.toLocaleString()} unique active users
            </p>
          </article>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="card">
            <h2 className="font-display text-xl font-bold text-gray-900">Traffic Trend (14 Days)</h2>
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
            <h2 className="font-display text-xl font-bold text-gray-900">Points and Minutes Output</h2>
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
            <h2 className="font-display text-xl font-bold text-gray-900">Top Contributors</h2>
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
            <h2 className="font-display text-xl font-bold text-gray-900">User Status</h2>
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
          <h2 className="font-display text-xl font-bold text-gray-900">Top Users Detail</h2>
          <p className="mt-1 text-sm text-ink-muted">Expanded ranking breakdown for the top contributors.</p>
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
                    <td className="font-semibold text-gray-900">#{user.rank}</td>
                    <td>
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-ink-muted">{user.email}</p>
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
                    <td colSpan={10} className="text-center text-ink-muted">
                      No top-user details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-gray-900">Category Mix (Recent Activity Logs)</h2>
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
          <h2 className="font-display text-xl font-bold text-gray-900">Traffic Detail (Last 14 Days)</h2>
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
                    <td colSpan={5} className="text-center text-ink-muted">
                      No traffic rows available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card mb-8">
          <h2 className="font-display text-xl font-bold text-gray-900">All Users</h2>
          <p className="mt-1 text-sm text-ink-muted">Detailed user-level metrics and account status.</p>
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
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-ink-muted">{user.email}</p>
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
                    <td colSpan={8} className="text-center text-ink-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900">Recent Activity Logs</h2>
          <p className="mt-1 text-sm text-ink-muted">Latest 100 activity logs across the platform.</p>
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
                      <p className="font-semibold text-gray-900">{item.username}</p>
                      <p className="text-xs text-ink-muted">{item.email}</p>
                    </td>
                    <td>{item.goalTitle}</td>
                    <td>{item.category}</td>
                    <td className="text-right">{item.minutesSpent.toLocaleString()}</td>
                    <td>{item.logDate}</td>
                  </tr>
                ))}
                {data.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-ink-muted">
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
