import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoalById, updateGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';

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
    if (id) {
      dispatch(fetchGoalById(Number(id)));
    }
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
    if (updateGoal.fulfilled.match(result)) {
      navigate('/goals');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading('delete');
    const result = await dispatch(deleteGoal(Number(id)));
    setActionLoading(null);
    if (deleteGoal.fulfilled.match(result)) {
      navigate('/goals');
    }
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
      // Refresh the selected goal
      dispatch(fetchGoalById(Number(id)));
    }
  };

  const isArchived = selectedGoal ? !selectedGoal.isActive : false;

  return (
    <>
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {/* ── Page heading ── */}
        <section className="section-heading">
          <p className="status-chip">Goal Edit</p>
          <h1 className="section-title mt-3">Edit Goal</h1>
          <p className="section-subtitle">Adjust scope and difficulty to keep progress realistic.</p>
        </section>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
              {successMsg}
            </div>
          )}

          <div>
            <label htmlFor="goal-edit-title" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
              Title
            </label>
            <input
              id="goal-edit-title"
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="goal-edit-description" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
              Description
            </label>
            <textarea
              id="goal-edit-description"
              className="textarea-field"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-edit-difficulty" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
                Difficulty <span className="font-normal text-[var(--ff-text-500)]">(1–5)</span>
              </label>
              <input
                id="goal-edit-difficulty"
                type="number"
                min={1}
                max={5}
                className="input-field"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) || 1 })}
              />
            </div>
            <div>
              <label htmlFor="goal-edit-minutes" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
                Daily Minutes
              </label>
              <input
                id="goal-edit-minutes"
                type="number"
                min={10}
                max={600}
                className="input-field"
                value={formData.dailyMinimumMinutes}
                onChange={(e) => setFormData({ ...formData, dailyMinimumMinutes: Number(e.target.value) || 10 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-edit-start-date" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
                Start Date
              </label>
              <input
                id="goal-edit-start-date"
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="goal-edit-end-date" className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">
                End Date <span className="font-normal text-[var(--ff-text-500)]">(optional)</span>
              </label>
              <input
                id="goal-edit-end-date"
                type="date"
                className="input-field"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* ── Save button ── */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !!actionLoading}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* ── Danger zone ── */}
        <div className="mt-6 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-5 shadow-e1">
          <h2 className="mb-1 text-sm font-semibold text-[var(--ff-text-900)]">Danger Zone</h2>
          <p className="mb-4 text-xs text-[var(--ff-text-500)]">
            These actions are permanent or change the visibility of your goal.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Archive / Unarchive */}
            <button
              type="button"
              onClick={handleArchiveToggle}
              disabled={!!actionLoading || loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] transition-colors hover:bg-[var(--ff-surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'archive' ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-[var(--ff-text-700)]">
                  {isArchived ? 'unarchive' : 'archive'}
                </span>
              )}
              {isArchived ? 'Unarchive Goal' : 'Archive Goal'}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={!!actionLoading || loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-rose-300/60 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Goal
            </button>
          </div>
        </div>
    </main>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
              <span className="material-symbols-outlined text-2xl text-rose-600 dark:text-rose-400">delete_forever</span>
            </div>

            <h3 className="mt-4 text-lg font-bold text-[var(--ff-text-900)]">Delete this goal?</h3>
            <p className="mt-1.5 text-sm text-[var(--ff-text-700)]">
              This will permanently delete <strong>"{selectedGoal?.title}"</strong> and all its associated activity logs. This action cannot be undone.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] transition-colors hover:bg-[var(--ff-surface-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
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
