import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoals } from '../../store/goalsSlice';
import Navbar from '../Layout/Navbar';
import GoalCard from './GoalCard';

const GoalsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, loading, error } = useSelector((state: RootState) => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-6xl">
        <section className="section-heading">
          <p className="status-chip">Goals</p>
          <h1 className="section-title mt-3">Your Goals</h1>
          <p className="section-subtitle">Manage active goals and keep each one aligned with your daily schedule.</p>
        </section>

        <div className="mb-5 flex justify-end">
          <Link to="/goals/new" className="btn-primary">
            Create Goal
          </Link>
        </div>

        {loading && (
          <div className="card">
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          </div>
        )}

        {error && !loading && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && goals.length === 0 && (
          <div className="card text-center">
            <p className="text-ink-muted">No goals found. Start by creating your first goal.</p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={(goalId) => dispatch(deleteGoal(goalId))} />
          ))}
        </section>
      </main>
    </div>
  );
};

export default GoalsList;
