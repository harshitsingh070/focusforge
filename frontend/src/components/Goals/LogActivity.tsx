import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById } from '../../store/goalsSlice';
import Navbar from '../Layout/Navbar';
import LogActivityModal from '../Activity/LogActivityModal';

const LogActivity: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedGoal, loading } = useSelector((state: RootState) => state.goals);

  // Fetch the goal directly from goalsSlice so this page works even if
  // the user navigates here directly without going through the dashboard.
  useEffect(() => {
    if (id) {
      dispatch(fetchGoalById(Number(id)));
    }
  }, [dispatch, id]);

  if (!id) {
    navigate('/goals');
    return null;
  }

  if (loading) {
    return (
      <div
        className="min-h-screen pt-[82px] bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]"
      >
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" />
        </div>
      </div>
    );
  }

  // Goal not found or not active
  if (!selectedGoal || selectedGoal.id !== Number(id)) {
    return (
      <div
        className="min-h-screen pt-[82px] bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]"
      >
        <Navbar />
        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-12 shadow-e2">
            <span className="material-symbols-outlined mb-3 block text-4xl text-[var(--ff-text-500)]">search_off</span>
            <h2 className="text-lg font-bold text-[var(--ff-text-900)]">Goal not found</h2>
            <p className="mt-1 text-sm text-[var(--ff-text-700)]">
              This goal may have been deleted or you don&apos;t have access.
            </p>
            <button
              onClick={() => navigate('/goals')}
              className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 hover:brightness-105"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Goals
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedGoal.isActive) {
    return (
      <div
        className="min-h-screen pt-[82px] bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]"
      >
        <Navbar />
        <main className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-12 shadow-e2">
            <span className="material-symbols-outlined mb-3 block text-4xl text-amber-500">archive</span>
            <h2 className="text-lg font-bold text-[var(--ff-text-900)]">Goal is archived</h2>
            <p className="mt-1 text-sm text-[var(--ff-text-700)]">
              Unarchive <strong>{selectedGoal.title}</strong> before logging activity.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => navigate('/goals')}
                className="rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] hover:bg-[var(--ff-surface-hover)]"
              >
                Back to Goals
              </button>
              <button
                onClick={() => navigate(`/goals/${id}/edit`)}
                className="rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 hover:brightness-105"
              >
                Edit Goal
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-[82px] bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]"
    >
      <Navbar />
      <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
        <LogActivityModal
          goalId={selectedGoal.id}
          goalTitle={selectedGoal.title}
          dailyTarget={selectedGoal.dailyMinimumMinutes}
          onClose={() => navigate(`/goals/${id}`)}
        />
      </main>
    </div>
  );
};

export default LogActivity;
