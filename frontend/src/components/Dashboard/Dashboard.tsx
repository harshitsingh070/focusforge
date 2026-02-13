import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { deleteGoal, fetchGoals } from '../../store/goalsSlice';
import { fetchNotifications, markNotificationRead } from '../../store/notificationsSlice';
import { BadgeAward, NotificationItem } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';
import Navbar from '../Layout/Navbar';
import ConfirmDeleteGoalModal from './ConfirmDeleteGoalModal';
import GoalCard from './GoalCard';
import RecentActivities from './RecentActivities';
import StatCard from './StatCard';
import StreakCounter from './StreakCounter';
import UpcomingBadges from './UpcomingBadges';
import WeeklyChart from './WeeklyChart';

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [selectedGoalTarget, setSelectedGoalTarget] = useState<number>(600);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<BadgeAward[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);
  const [goalPendingDelete, setGoalPendingDelete] = useState<{ id: number; title: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

  const runDashboardRefresh = useCallback(
    async (silent = false) => {
      if (!silent) {
        setRefreshing(true);
      }
      setActionError(null);

      const results = await Promise.allSettled([
        dispatch(fetchDashboard()).unwrap(),
        dispatch(fetchGoals()).unwrap(),
        dispatch(fetchNotifications()).unwrap(),
      ]);

      const hasFailure = results.some((result) => result.status === 'rejected');
      if (hasFailure) {
        setActionError('Some sections failed to refresh. Please try again.');
      } else if (!silent) {
        setActionMessage('Dashboard refreshed.');
      }

      setLastRefreshAt(new Date());
      if (!silent) {
        setRefreshing(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    runDashboardRefresh(true);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        runDashboardRefresh(true);
      }
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [runDashboardRefresh]);

  useEffect(() => {
    if (newlyEarnedBadges.length === 0) {
      return;
    }

    const timer = setTimeout(() => setNewlyEarnedBadges([]), 6000);
    return () => clearTimeout(timer);
  }, [newlyEarnedBadges]);

  useEffect(() => {
    if (!actionMessage && !actionError) {
      return;
    }
    const timer = setTimeout(() => {
      setActionMessage(null);
      setActionError(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [actionMessage, actionError]);

  const handleCreateGoal = () => navigate('/goals/new');

  const handleLogActivity = (goalId: number) => {
    const goal = data?.activeGoals.find((item) => item.goalId === goalId);
    setSelectedGoal(goalId);
    setSelectedGoalTarget(goal?.dailyTarget || 600);
    setShowLogModal(true);
  };

  const handleDeleteGoalPrompt = (goalId: number, title: string) => {
    setGoalPendingDelete({ id: goalId, title });
  };

  const handleDeleteGoal = async () => {
    if (!goalPendingDelete) {
      return;
    }

    setActionMessage(null);
    setActionError(null);
    setDeletingGoalId(goalPendingDelete.id);

    try {
      await dispatch(deleteGoal(goalPendingDelete.id)).unwrap();
      setActionMessage(`Goal "${goalPendingDelete.title}" deleted.`);
      await runDashboardRefresh(true);
    } catch (err: any) {
      setActionError(typeof err === 'string' ? err : 'Failed to delete goal.');
    } finally {
      setDeletingGoalId(null);
      setGoalPendingDelete(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="text-ink-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container max-w-4xl">
          <div className="card border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-700">Dashboard failed to load</h2>
            <p className="mt-2 text-sm text-red-600">{error || 'Unable to fetch dashboard data.'}</p>
            <button onClick={() => runDashboardRefresh(false)} className="btn-primary mt-5">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      {newlyEarnedBadges.length > 0 && (
        <div className="fixed inset-x-4 top-20 z-50 mx-auto w-auto max-w-md rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-soft sm:right-6 sm:left-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-amber-900">Badge unlocked</p>
              {newlyEarnedBadges.map((badge) => (
                <p key={badge.id} className="mt-1 text-sm text-amber-800">
                  {badge.iconUrl || 'Badge'} {badge.name}
                </p>
              ))}
            </div>
            <button onClick={() => setNewlyEarnedBadges([])} className="btn-ghost px-2 py-1 text-xs text-amber-900">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="page-container">
        {(actionMessage || actionError || error) && (
          <div className="mb-4 space-y-2">
            {actionMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm text-emerald-700">{actionMessage}</p>
              </div>
            )}
            {(actionError || error) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">{actionError || `Dashboard sync warning: ${error}`}</p>
              </div>
            )}
          </div>
        )}

        <section className="section-heading">
          <h1 className="section-title">Hello, {data.username}</h1>
          <p className="section-subtitle">{data.insight}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={handleCreateGoal} className="btn-primary">
              Create Goal
            </button>
            <button onClick={() => runDashboardRefresh(false)} className="btn-secondary" disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {lastRefreshAt && (
              <p className="text-xs text-ink-muted">
                Last updated: {lastRefreshAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Points" value={data.totalPoints.toLocaleString()} variant="primary" />
          <StreakCounter streak={data.globalStreak} />
          <div className="sm:col-span-2 xl:col-span-1">
            <StatCard label="Active Goals" value={data.activeGoals.length} variant="success" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-gray-900">Your Goals</h2>
              <button onClick={handleCreateGoal} className="btn-secondary text-sm">
                New Goal
              </button>
            </div>

            {data.activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.goalId}
                    goal={goal}
                    deleting={deletingGoalId === goal.goalId}
                    onLogActivity={handleLogActivity}
                    onDeleteGoal={handleDeleteGoalPrompt}
                  />
                ))}
              </div>
            ) : (
              <div className="card text-center">
                <p className="mb-4 text-ink-muted">No active goals yet.</p>
                <button onClick={handleCreateGoal} className="btn-primary">
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <WeeklyChart data={data.weeklyProgress} />
            <RecentActivities activities={data.recentActivities} />
            <UpcomingBadges badges={data.recentBadges} />

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-gray-900">Notifications</h3>
                <span className="status-chip">{unreadCount} unread</span>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 4).map((notification: NotificationItem) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl border p-3 ${
                      notification.isRead ? 'border-slate-200 bg-white/70' : 'border-primary-200 bg-primary-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-xs text-ink-muted">{notification.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-ink-muted">{new Date(notification.createdAt).toLocaleDateString()}</p>
                      {!notification.isRead && (
                        <button
                          onClick={() => dispatch(markNotificationRead(notification.id))}
                          className="btn-ghost px-2 py-1 text-xs text-primary-700"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-sm text-ink-muted">No notifications yet.</p>}
              </div>
            </div>
          </div>
        </section>
      </main>

      {showLogModal && selectedGoal && (
        <LogActivityModal
          goalId={selectedGoal}
          goalTitle={data.activeGoals.find((item) => item.goalId === selectedGoal)?.title || ''}
          dailyTarget={selectedGoalTarget}
          onBadgesEarned={(badges) => {
            setNewlyEarnedBadges(badges);
            dispatch(fetchNotifications());
          }}
          onClose={() => {
            setShowLogModal(false);
            setSelectedGoal(null);
            setSelectedGoalTarget(600);
          }}
        />
      )}

      {goalPendingDelete && (
        <ConfirmDeleteGoalModal
          goalTitle={goalPendingDelete.title}
          loading={deletingGoalId === goalPendingDelete.id}
          onCancel={() => {
            if (deletingGoalId !== goalPendingDelete.id) {
              setGoalPendingDelete(null);
            }
          }}
          onConfirm={handleDeleteGoal}
        />
      )}
    </div>
  );
};

export default Dashboard;
