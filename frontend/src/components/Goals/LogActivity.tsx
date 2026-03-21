import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById } from '../../store/goalsSlice';
import LogActivityModal from '../Activity/LogActivityModal';

const LogActivity: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading } = useSelector((state: RootState) => state.goals);

  useEffect(() => { if (id) dispatch(fetchGoalById(Number(id))); }, [dispatch, id]);

  if (!id) { navigate('/goals'); return null; }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500" />
      </div>
    );
  }

  if (!selectedGoal || selectedGoal.id !== Number(id)) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 shadow-sm">
          <span className="material-symbols-outlined mb-3 block text-4xl text-slate-400 dark:text-slate-500">search_off</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Goal not found</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This goal may have been deleted or you don&apos;t have access.</p>
          <button
            onClick={() => navigate('/goals')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-500 hover:to-purple-500 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Goals
          </button>
        </div>
      </main>
    );
  }

  if (!selectedGoal.isActive) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 shadow-sm">
          <span className="material-symbols-outlined mb-3 block text-4xl text-amber-500">archive</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Goal is archived</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Unarchive <strong>{selectedGoal.title}</strong> before logging activity.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => navigate('/goals')} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Back to Goals</button>
            <button onClick={() => navigate(`/goals/${id}/edit`)} className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-500 hover:to-purple-500 transition-all">Edit Goal</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <LogActivityModal
        goalId={selectedGoal.id}
        goalTitle={selectedGoal.title}
        dailyTarget={selectedGoal.dailyMinimumMinutes}
        onClose={() => navigate(`/goals/${id}`)}
      />
    </main>
  );
};

export default LogActivity;
