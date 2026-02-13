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

      <main className="page-container max-w-6xl">
        <section className="section-heading">
          <p className="status-chip">History</p>
          <h1 className="section-title mt-3">Activity Log</h1>
          <p className="section-subtitle">Track your submissions and patterns over time.</p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <ActivityForm onSubmitted={() => dispatch(fetchActivities(filters))} />
            <DateRangeFilter
              filters={filters}
              goals={goals}
              onChange={(nextFilters) => dispatch(setActivityFilters(nextFilters))}
            />
          </div>

          <section className="space-y-3 lg:col-span-2">
            {loading && (
              <div className="card">
                <div className="flex justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
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
