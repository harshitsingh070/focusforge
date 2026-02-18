import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoals } from '../../store/goalsSlice';
import { Goal } from '../../types';
import Navbar from '../Layout/Navbar';

const GoalsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, loading, error } = useSelector((state: RootState) => state.goals);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

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

  const estimateProgress = (goal: Goal) => {
    const streakScale = Math.max(goal.longestStreak, goal.currentStreak, 1);
    const streakRatio = goal.currentStreak / streakScale;
    const difficultyRatio = Math.max(1, Math.min(goal.difficulty || 1, 5)) / 5;
    const targetRatio = Math.min((goal.dailyMinimumMinutes || 0) / 120, 1);
    const blended = streakRatio * 0.5 + difficultyRatio * 0.3 + targetRatio * 0.2;
    return Math.max(10, Math.min(100, Math.round(blended * 100)));
  };

  const handleDeleteGoal = async (goalId: number) => {
    setDeletingGoalId(goalId);
    try {
      await dispatch(deleteGoal(goalId));
    } finally {
      setDeletingGoalId((current) => (current === goalId ? null : current));
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container ff-goals-page">
        <section className="section-heading ff-goals-hero">
          <div>
            <h1 className="section-title">Your Goals</h1>
            <p className="section-subtitle">Manage active and completed goals</p>
          </div>
          <Link to="/goals/new" className="btn-primary ff-goals-create-btn">
            + Create Goal
          </Link>
        </section>

        <div className="ff-goal-filters">
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

        <section className="ff-goals-grid">
          {filteredGoals.map((goal) => {
            const progressPercent = estimateProgress(goal);
            const goalColor = goal.categoryColor || '#5EA8FF';
            const ringStyle = {
              ['--ring-value' as string]: `${progressPercent}%`,
              ['--ring-color' as string]: goalColor,
            } as React.CSSProperties;

            return (
              <article key={goal.id} className="card ff-goal-tile">
                <span
                  className="ff-goal-tile__accent"
                  style={{
                    background: `linear-gradient(180deg, ${goalColor}, rgba(255, 255, 255, 0.18))`,
                  }}
                />

                <div className="ff-goal-tile__content">
                  <div className="ff-goal-tile__header">
                    <div className="min-w-0">
                      <h3 className="ff-goal-title">{goal.title}</h3>
                      <p className="ff-goal-description">{goal.description || 'No description yet for this goal.'}</p>
                    </div>
                    <span
                      className={`status-chip ff-goal-status-badge ${goal.isActive ? '' : 'warn'}`}
                      style={goal.isActive ? { background: `${goalColor}20`, color: goalColor } : undefined}
                    >
                      {goal.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="ff-goal-metrics">
                    <p className="ff-goal-meta">
                      <strong>Difficulty:</strong> {Math.max(1, Math.min(goal.difficulty || 1, 5))}/5
                    </p>
                    <p className="ff-goal-meta">
                      <strong>Current Streak:</strong> {goal.currentStreak} days
                    </p>
                  </div>

                  <div className="ff-goal-progress-area">
                    <div className="ff-ring-wrap">
                      <div className="ff-ring" style={ringStyle} />
                      <p className="ff-ring__label">{progressPercent}%</p>
                    </div>
                  </div>

                  <div className="ff-goal-footer">
                    <div>
                      <p className="ff-goal-meta">
                        <strong>Daily Target:</strong> {goal.dailyMinimumMinutes} min
                      </p>
                      <p className="ff-goal-meta">
                        <strong>Best Streak:</strong> {goal.longestStreak} days
                      </p>
                    </div>

                    <Link to={`/goals/${goal.id}`} className="ff-goal-open-link">
                      Open
                    </Link>
                  </div>

                  <div className="ff-goal-quick-actions">
                    <Link to={`/goals/${goal.id}/edit`} className="ff-goal-action">
                      Edit
                    </Link>
                    <Link to={`/goals/${goal.id}/log`} className="ff-goal-action ff-goal-action--primary">
                      Log
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="ff-goal-action ff-goal-action--delete"
                      disabled={deletingGoalId === goal.id}
                    >
                      {deletingGoalId === goal.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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
