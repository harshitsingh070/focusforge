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

const ActivityLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error, filters } = useSelector((state: RootState) => state.activity);
  const { goals } = useSelector((state: RootState) => state.goals);

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);
  useEffect(() => { dispatch(fetchActivities(filters)); }, [dispatch, filters]);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Activity</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Log daily effort and review your verified timeline.</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] p-4 sm:p-8">
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
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Timeline</h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Most recent logs appear first.</p>
              </div>
              <StatusBadge variant="primary">{activities.length} entries</StatusBadge>
            </div>

            {loading && (
              <div className="flex justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500" />
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
