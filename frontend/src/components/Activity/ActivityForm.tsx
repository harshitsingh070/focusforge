import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logActivity } from '../../store/activitySlice';
import { ActivityRequest } from '../../types';

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

    if (!form.goalId) {
      setError('Select a goal first.');
      return;
    }

    try {
      await dispatch(logActivity(form)).unwrap();
      onSubmitted?.();
      setForm((prev) => ({ ...prev, minutesSpent: 30, notes: '' }));
    } catch (requestError) {
      const message = typeof requestError === 'string' ? requestError : 'Failed to log activity';
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-5xl font-extrabold tracking-tight text-slate-900">Log Activity</h3>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-5 rounded-2xl border border-white/90 bg-white/72 p-3 shadow-sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="activity-goal-select" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Goal
            </label>
            <select
              id="activity-goal-select"
              className="select-field"
              value={form.goalId || ''}
              onChange={(event) => setForm({ ...form, goalId: Number(event.target.value) })}
              required
            >
              <option value="">Select a goal...</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activity-date-input" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Date
            </label>
            <input
              id="activity-date-input"
              type="date"
              className="input-field"
              value={form.logDate}
              onChange={(event) => setForm({ ...form, logDate: event.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="activity-minutes-slider" className="text-sm font-semibold text-slate-700">
                Minutes
              </label>
              <span className="text-2xl font-bold text-slate-800">{form.minutesSpent}</span>
            </div>
            <input
              id="activity-minutes-slider"
              type="range"
              min={10}
              max={180}
              step={5}
              value={Math.max(10, Math.min(180, form.minutesSpent))}
              onChange={(event) => setForm({ ...form, minutesSpent: Number(event.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500"
            />
          </div>

          <div>
            <label htmlFor="activity-notes-input" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Notes
            </label>
            <textarea
              id="activity-notes-input"
              className="textarea-field"
              rows={4}
              value={form.notes || ''}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="What did you work on?"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary mt-5 w-full text-lg" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Activity'}
      </button>
    </form>
  );
};

export default ActivityForm;
