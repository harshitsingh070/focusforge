import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById } from '../../store/goalsSlice';
import LogActivityModal from '../Activity/LogActivityModal';
import styles from '../Dashboard/Dashboard.module.css';

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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
      </div>
    );
  }

  if (!selectedGoal || selectedGoal.id !== Number(id)) {
    return (
      <div className={`${styles.dashboardThemeScope} mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6`}>
        <div className={`${styles.dashboardPanelCard} rounded-2xl p-12`}>
          <span className={`material-symbols-outlined mb-3 block text-4xl ${styles.dashboardGoalMeta}`}>search_off</span>
          <h2 className={`text-lg font-bold ${styles.dashboardGoalTitle}`}>Goal not found</h2>
          <p className={`mt-1 text-sm ${styles.dashboardGoalMeta}`}>This goal may have been deleted or you don&apos;t have access.</p>
          <button
            onClick={() => navigate('/goals')}
            className={`${styles.dashboardGoalButtonPrimary} mt-5 inline-flex items-center gap-2`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGoal.isActive) {
    return (
      <div className={`${styles.dashboardThemeScope} mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6`}>
        <div className={`${styles.dashboardPanelCard} rounded-2xl p-12`}>
          <span className="material-symbols-outlined mb-3 block text-4xl text-amber-500">archive</span>
          <h2 className={`text-lg font-bold ${styles.dashboardGoalTitle}`}>Goal is archived</h2>
          <p className={`mt-1 text-sm ${styles.dashboardGoalMeta}`}>
            Unarchive <strong>{selectedGoal.title}</strong> before logging activity.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => navigate('/goals')} className={styles.dashboardGoalButtonSecondary}>Back to Goals</button>
            <button onClick={() => navigate(`/goals/${id}/edit`)} className={styles.dashboardGoalButtonPrimary}>Edit Goal</button>
          </div>
        </div>
      </div>
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
