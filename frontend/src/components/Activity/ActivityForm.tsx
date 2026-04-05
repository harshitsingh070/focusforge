import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logActivity } from '../../store/activitySlice';
import { fetchDashboard } from '../../store/dashboardSlice';
import { useFeedback } from '../../contexts/FeedbackContext';
import { ActivityLog, ActivityRequest } from '../../types';
import { buildActivityFeedback } from '../../utils/feedback';
import styles from '../Dashboard/Dashboard.module.css';

interface ActivityFormProps {
  onSubmitted?: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmitted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { pushToast, showReward } = useFeedback();
  const { goals } = useSelector((state: RootState) => state.goals);
  const { loading } = useSelector((state: RootState) => state.activity);

  const firstGoalId = useMemo(() => goals[0]?.id || 0, [goals]);
  const [form, setForm] = useState<ActivityRequest>({
    goalId: firstGoalId,
    logDate: new Date().toISOString().split('T')[0],
    minutesSpent: 30,
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.goalId && firstGoalId) {
      setForm((prev) => ({ ...prev, goalId: firstGoalId }));
    }
  }, [firstGoalId, form.goalId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.goalId) { setError('Select a goal first.'); return; }
    try {
      const activity = (await dispatch(logActivity(form)).unwrap()) as ActivityLog;
      await dispatch(fetchDashboard());

      const selectedGoalTitle = goals.find((goal) => goal.id === form.goalId)?.title;
      const feedbackPlan = buildActivityFeedback(activity, selectedGoalTitle);
      feedbackPlan.toasts.forEach((toast) => pushToast(toast));
      feedbackPlan.rewards.forEach((reward) => showReward(reward));

      onSubmitted?.();
      setForm((prev) => ({ ...prev, minutesSpent: 30, notes: '' }));
    } catch (requestError) {
      setError(typeof requestError === 'string' ? requestError : 'Failed to log activity');
    }
  };

  const inputCls =
    'w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] ' +
    'bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3.5 py-2.5 text-sm ' +
    'text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-all duration-200 ' +
    'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 ' +
    'placeholder:text-[var(--ff-dashboard-text-muted,var(--ff-text-500))]';

  const labelCls = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`;

  return (
    <section className={`${styles.dashboardPanelCard} rounded-2xl p-5 sm:p-6`}>
      <form onSubmit={handleSubmit}>
        <h3 className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>Log Activity</h3>

        {error && (
          <div className="mt-3 rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Goal select */}
          <div>
            <label htmlFor="activity-goal-select" className={labelCls}>Goal</label>
            <select
              id="activity-goal-select"
              className={`${inputCls} appearance-none cursor-pointer`}
              value={form.goalId || ''}
              onChange={(e) => setForm({ ...form, goalId: Number(e.target.value) })}
              required
            >
              <option value="">Select a goal...</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="activity-date-input" className={labelCls}>Date</label>
            <input
              id="activity-date-input"
              type="date"
              className={inputCls}
              value={form.logDate}
              onChange={(e) => setForm({ ...form, logDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Minutes slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="activity-minutes-slider" className={labelCls}>Minutes</label>
              <span className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>{form.minutesSpent}</span>
            </div>
            <input
              id="activity-minutes-slider"
              type="range"
              min={10}
              max={180}
              step={5}
              value={Math.max(10, Math.min(180, form.minutesSpent))}
              onChange={(e) => setForm({ ...form, minutesSpent: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-violet-500"
              style={{ background: 'var(--ff-dashboard-track, var(--ff-surface-hover))' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="activity-notes-input" className={labelCls}>Notes</label>
            <textarea
              id="activity-notes-input"
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you work on?"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${styles.dashboardGoalButtonPrimary} w-full mt-5`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Submitting…
            </span>
          ) : 'Submit Activity'}
        </button>
      </form>
    </section>
  );
};

export default ActivityForm;
