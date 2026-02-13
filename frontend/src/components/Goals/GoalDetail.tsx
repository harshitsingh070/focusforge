import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById, setSelectedGoal } from '../../store/goalsSlice';
import Navbar from '../Layout/Navbar';

const GoalDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading, error } = useSelector((state: RootState) => state.goals);

  useEffect(() => {
    if (id) {
      dispatch(fetchGoalById(Number(id)));
    }

    return () => {
      dispatch(setSelectedGoal(null));
    };
  }, [dispatch, id]);

  if (!id) {
    navigate('/goals');
    return null;
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-4xl">
        <section className="section-heading">
          <p className="status-chip">Goal Detail</p>
          <h1 className="section-title mt-3">Goal Overview</h1>
          <p className="section-subtitle">Detailed progress, configuration, and streak statistics.</p>
        </section>

        {loading && (
          <div className="card">
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          </div>
        )}

        {error && !loading && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && selectedGoal && (
          <article className="card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${selectedGoal.categoryColor}20`, color: selectedGoal.categoryColor }}
                >
                  {selectedGoal.category}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
              </div>
              <span className={`status-chip ${selectedGoal.isActive ? '' : 'warn'}`}>
                {selectedGoal.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-700">{selectedGoal.description || 'No description provided.'}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">Difficulty</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.difficulty}/5</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">Daily Minimum</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.dailyMinimumMinutes} minutes</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">Current Streak</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.currentStreak}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">Longest Streak</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.longestStreak}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">Start Date</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.startDate}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-ink-muted">End Date</p>
                <p className="text-lg font-semibold text-gray-900">{selectedGoal.endDate || 'Open ended'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to={`/goals/${selectedGoal.id}/edit`} className="btn-secondary">
                Edit Goal
              </Link>
              <Link to={`/goals/${selectedGoal.id}/log`} className="btn-primary">
                Log Activity
              </Link>
              <Link to="/goals" className="btn-secondary">
                Back to Goals
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default GoalDetail;
