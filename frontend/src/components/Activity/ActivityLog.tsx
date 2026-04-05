import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchActivities, setActivityFilters } from '../../store/activitySlice';
import { fetchGoals } from '../../store/goalsSlice';
import ActivityEntry from './ActivityEntry';
import ActivityForm from './ActivityForm';
import DateRangeFilter from './DateRangeFilter';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';
import styles from '../Dashboard/Dashboard.module.css';

const ActivityLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error, filters } = useSelector((state: RootState) => state.activity);
  const { goals } = useSelector((state: RootState) => state.goals);

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);
  useEffect(() => { dispatch(fetchActivities(filters)); }, [dispatch, filters]);

  return (
    <>
      <div className={`${styles.dashboardThemeScope} mx-auto max-w-[1280px] p-4 sm:p-8`}>
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Activity</h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Log daily effort and review your verified timeline.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
          {/* Left: Form + Filters */}
          <div className="space-y-4">
            <ActivityForm onSubmitted={() => dispatch(fetchActivities(filters))} />
            <DateRangeFilter
              filters={filters}
              goals={goals}
              onChange={(nextFilters) => dispatch(setActivityFilters(nextFilters))}
            />
          </div>

          {/* Right: Timeline */}
          <section className="space-y-3">
            <div className={`${styles.dashboardPanelCard} flex flex-col items-start gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${styles.dashboardGoalTitle}`}>Timeline</h2>
                <p className={`mt-0.5 text-sm ${styles.dashboardGoalMeta}`}>Most recent logs appear first.</p>
              </div>
              <StatusBadge variant="primary">{activities.length} entries</StatusBadge>
            </div>

            {loading && (
              <div className={`${styles.dashboardPanelCard} flex justify-center rounded-2xl py-12`}>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {!loading && activities.length === 0 && (
              <EmptyState
                icon="event_note"
                title="No activity entries"
                description="Log your first activity using the form on the left."
              />
            )}

            {!loading && activities.map((activity) => <ActivityEntry key={activity.id} activity={activity} />)}
          </section>
        </div>
      </div>
    </>
  );
};

export default ActivityLog;
