import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoals } from '../../store/goalsSlice';
import Navbar from '../Layout/Navbar';

const GoalsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, loading, error } = useSelector((state: RootState) => state.goals);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(goals.map((goal) => goal.category).filter(Boolean)))],
    [goals]
  );

  const filteredGoals = useMemo(
    () => goals.filter((goal) => selectedCategory === 'All' || goal.category === selectedCategory),
    [goals, selectedCategory]
  );

  const estimateProgress = (currentStreak: number, longestStreak: number) => {
    if (longestStreak <= 0 && currentStreak <= 0) {
      return 12;
    }

    const base = longestStreak > 0 ? (currentStreak / longestStreak) * 100 : currentStreak * 8;
    return Math.max(8, Math.min(100, Math.round(base)));
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="section-title">Your Goals</h1>
              <p className="section-subtitle">Manage active and completed goals with clear daily targets.</p>
            </div>
            <Link to="/goals/new" className="btn-primary">
              + Create Goal
            </Link>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`ff-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="card text-center">
            <div className="flex justify-center py-8">
              <div className="h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            </div>
          </div>
        )}

        {error && !loading && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && filteredGoals.length === 0 && (
          <div className="card text-center">
            <p className="text-ink-muted">No goals found for this filter. Try a different category.</p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.map((goal) => {
            const progressPercent = estimateProgress(goal.currentStreak, goal.longestStreak);
            const ringStyle = {
              ['--ring-value' as string]: `${progressPercent}%`,
              ['--ring-color' as string]: goal.categoryColor || '#3B82F6',
            } as React.CSSProperties;

            return (
              <article key={goal.id} className="card relative overflow-hidden">
                <span
                  className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
                  style={{
                    background: `linear-gradient(180deg, ${goal.categoryColor || '#3B82F6'}, rgba(255,255,255,0.1))`,
                  }}
                />

                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="status-chip"
                      style={{ background: `${goal.categoryColor}20`, color: goal.categoryColor || '#3B82F6' }}
                    >
                      {goal.category}
                    </span>
                    <h3 className="mt-2 truncate text-2xl font-bold text-slate-900">{goal.title}</h3>
                  </div>
                  <span className={`status-chip ${goal.isActive ? '' : 'warn'}`}>{goal.isActive ? 'Active' : 'Paused'}</span>
                </div>

                <p className="line-clamp-2 text-sm text-slate-500">
                  {goal.description || 'No description set yet for this goal.'}
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="ff-ring-wrap">
                    <div className="ff-ring" style={ringStyle} />
                    <p className="ff-ring__label">{progressPercent}%</p>
                  </div>

                  <div className="flex-1 space-y-2 text-sm text-slate-600">
                    <p>Difficulty: {goal.difficulty}/5</p>
                    <p>Daily Target: {goal.dailyMinimumMinutes} min</p>
                    <p>Streak: {goal.currentStreak} days</p>
                    <p>Best: {goal.longestStreak} days</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <Link to={`/goals/${goal.id}`} className="btn-secondary text-center">
                    View
                  </Link>
                  <Link to={`/goals/${goal.id}/edit`} className="btn-secondary text-center">
                    Edit
                  </Link>
                  <Link to={`/goals/${goal.id}/log`} className="btn-primary text-center">
                    Log
                  </Link>
                  <button
                    type="button"
                    onClick={() => dispatch(deleteGoal(goal.id))}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default GoalsList;
