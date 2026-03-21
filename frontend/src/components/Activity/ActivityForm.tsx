import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logActivity } from '../../store/activitySlice';
import { ActivityRequest } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ActivityFormProps {
  onSubmitted?: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmitted }) => {
  const dispatch = useDispatch<AppDispatch>();
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
      await dispatch(logActivity(form)).unwrap();
      onSubmitted?.();
      setForm((prev) => ({ ...prev, minutesSpent: 30, notes: '' }));
    } catch (requestError) {
      setError(typeof requestError === 'string' ? requestError : 'Failed to log activity');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Log Activity</h3>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="activity-goal-select" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Goal
            </label>
            <select
              id="activity-goal-select"
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
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

          <div>
            <label htmlFor="activity-date-input" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              id="activity-date-input"
              type="date"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              value={form.logDate}
              onChange={(e) => setForm({ ...form, logDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="activity-minutes-slider" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Minutes
              </label>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{form.minutesSpent}</span>
            </div>
            <input
              id="activity-minutes-slider"
              type="range"
              min={10}
              max={180}
              step={5}
              value={Math.max(10, Math.min(180, form.minutesSpent))}
              onChange={(e) => setForm({ ...form, minutesSpent: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700 accent-violet-500"
            />
          </div>

          <div>
            <label htmlFor="activity-notes-input" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              id="activity-notes-input"
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              rows={3}
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What did you work on?"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth className="mt-5" loading={loading}>
          Submit Activity
        </Button>
      </form>
    </Card>
  );
};

export default ActivityForm;
