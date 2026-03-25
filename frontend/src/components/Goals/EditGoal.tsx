import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoalById, updateGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

const EditGoal: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading, error } = useSelector((state: RootState) => state.goals);

  const [formData, setFormData] = useState<GoalRequest>({
    categoryId: 1,
    title: '',
    description: '',
    difficulty: 3,
    dailyMinimumMinutes: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isPrivate: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<'delete' | 'archive' | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchGoalById(Number(id)));
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedGoal) return;
    setFormData({
      categoryId: 1,
      title: selectedGoal.title,
      description: selectedGoal.description,
      difficulty: selectedGoal.difficulty,
      dailyMinimumMinutes: selectedGoal.dailyMinimumMinutes,
      startDate: selectedGoal.startDate,
      endDate: selectedGoal.endDate || '',
      isPrivate: selectedGoal.isPrivate,
    });
  }, [selectedGoal]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    const payload: GoalRequest = { ...formData, endDate: formData.endDate || undefined };
    const result = await dispatch(updateGoal({ id: Number(id), goalRequest: payload }));
    if (updateGoal.fulfilled.match(result)) navigate('/goals');
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading('delete');
    const result = await dispatch(deleteGoal(Number(id)));
    setActionLoading(null);
    if (deleteGoal.fulfilled.match(result)) navigate('/goals');
  };

  const handleArchiveToggle = async () => {
    if (!id || !selectedGoal) return;
    setActionLoading('archive');
    const payload = {
      ...formData,
      endDate: formData.endDate || undefined,
      isActive: !selectedGoal.isActive,
    } as unknown as GoalRequest;
    const result = await dispatch(updateGoal({ id: Number(id), goalRequest: payload }));
    setActionLoading(null);
    if (updateGoal.fulfilled.match(result)) {
      const action = selectedGoal.isActive ? 'archived' : 'unarchived';
      setSuccessMsg(`Goal ${action} successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      dispatch(fetchGoalById(Number(id)));
    }
  };

  const isArchived = selectedGoal ? !selectedGoal.isActive : false;

  /* ── shared input class ── */
  const inputCls =
    'w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] ' +
    'bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-4 py-2.5 text-sm ' +
    'text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors ' +
    'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30';

  const labelCls = `mb-1 block text-xs font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`;

  return (
    <>
      <div className={`${styles.dashboardThemeScope} mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10`}>

        {/* ── Page heading ── */}
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative">
            <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>Goal Edit</span>
            <h1 className={`mt-3 text-2xl font-bold tracking-tight ${styles.dashboardGoalTitle}`}>Edit Goal</h1>
            <p className={`mt-0.5 text-sm ${styles.dashboardGoalMeta}`}>Adjust scope and difficulty to keep progress realistic.</p>
          </div>
        </section>

        {/* ── Form card ── */}
        <section className={`${styles.dashboardPanelCard} rounded-2xl p-6 sm:p-8`}>
          {error && (
            <div className="mb-4 rounded-xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-300/50 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="goal-edit-title" className={labelCls}>Title</label>
              <input
                id="goal-edit-title"
                type="text"
                className={inputCls}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="goal-edit-description" className={labelCls}>Description</label>
              <textarea
                id="goal-edit-description"
                className={`${inputCls} resize-none`}
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Difficulty + Daily Minutes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="goal-edit-difficulty" className={labelCls}>
                  Difficulty <span className={`font-normal ${styles.dashboardGoalMeta}`}>(1–5)</span>
                </label>
                <input
                  id="goal-edit-difficulty"
                  type="number"
                  min={1}
                  max={5}
                  className={inputCls}
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label htmlFor="goal-edit-minutes" className={labelCls}>Daily Minutes</label>
                <input
                  id="goal-edit-minutes"
                  type="number"
                  min={10}
                  max={600}
                  className={inputCls}
                  value={formData.dailyMinimumMinutes}
                  onChange={(e) => setFormData({ ...formData, dailyMinimumMinutes: Number(e.target.value) || 10 })}
                />
              </div>
            </div>

            {/* Start + End Date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="goal-edit-start-date" className={labelCls}>Start Date</label>
                <input
                  id="goal-edit-start-date"
                  type="date"
                  className={inputCls}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="goal-edit-end-date" className={labelCls}>
                  End Date <span className={`font-normal ${styles.dashboardGoalMeta}`}>(optional)</span>
                </label>
                <input
                  id="goal-edit-end-date"
                  type="date"
                  className={inputCls}
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={loading || !!actionLoading}
              className={`${styles.dashboardGoalButtonPrimary} w-full`}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* ── Danger Zone ── */}
        <section className={`${styles.dashboardPanelCard} mt-6 rounded-2xl p-5`} style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <h2 className={`mb-1 text-sm font-bold ${styles.dashboardGoalTitle}`}>Danger Zone</h2>
          <p className={`mb-4 text-xs ${styles.dashboardGoalMeta}`}>
            These actions are permanent or change the visibility of your goal.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Archive / Unarchive */}
            <button
              type="button"
              onClick={handleArchiveToggle}
              disabled={!!actionLoading || loading}
              className={`${styles.dashboardGoalButtonSecondary} flex flex-1 items-center justify-center gap-2`}
            >
              {actionLoading === 'archive' ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">{isArchived ? 'unarchive' : 'archive'}</span>
              )}
              {isArchived ? 'Unarchive Goal' : 'Archive Goal'}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={!!actionLoading || loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Goal
            </button>
          </div>
        </section>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={`${styles.dashboardPanelCard} w-full max-w-sm rounded-2xl p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
              <span className="material-symbols-outlined text-2xl text-rose-500">delete_forever</span>
            </div>

            <h3 className={`mt-4 text-lg font-bold ${styles.dashboardGoalTitle}`}>Delete this goal?</h3>
            <p className={`mt-1.5 text-sm ${styles.dashboardGoalMeta}`}>
              This will permanently delete <strong>"{selectedGoal?.title}"</strong> and all its associated activity logs. This action cannot be undone.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={`${styles.dashboardGoalButtonSecondary} flex-1`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                {actionLoading === 'delete' ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                )}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditGoal;
