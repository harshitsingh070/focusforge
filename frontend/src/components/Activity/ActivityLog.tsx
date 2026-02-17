import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchActivities, setActivityFilters } from '../../store/activitySlice';
import { fetchGoals } from '../../store/goalsSlice';
import Navbar from '../Layout/Navbar';
import ActivityEntry from './ActivityEntry';
import ActivityForm from './ActivityForm';
import DateRangeFilter from './DateRangeFilter';

const ActivityLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activities, loading, error, filters } = useSelector((state: RootState) => state.activity);
  const { goals } = useSelector((state: RootState) => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchActivities(filters));
  }, [dispatch, filters]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <h1 className="section-title">Activity</h1>
          <p className="section-subtitle">Log daily effort and review your verified timeline.</p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
          <div className="space-y-4">
            <ActivityForm onSubmitted={() => dispatch(fetchActivities(filters))} />
            <DateRangeFilter
              filters={filters}
              goals={goals}
              onChange={(nextFilters) => dispatch(setActivityFilters(nextFilters))}
            />
          </div>

          <section className="space-y-3">
            <div className="card flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Timeline</h2>
                <p className="mt-1 text-sm text-slate-500">Most recent logs appear first.</p>
              </div>
              <span className="status-chip">{activities.length} entries</span>
            </div>

            {loading && (
              <div className="card text-center">
                <div className="flex justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {!loading && activities.length === 0 && (
              <div className="card text-center">
                <p className="text-ink-muted">No activity entries found.</p>
              </div>
            )}

            {!loading &&
              activities.map((activity) => <ActivityEntry key={activity.id} activity={activity} />)}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ActivityLog;
