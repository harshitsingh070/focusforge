import React, { useMemo, useState } from 'react';
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
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-display text-lg font-bold text-gray-900">Log Activity</h3>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div>
        <label htmlFor="activity-goal-select" className="mb-1 block text-sm font-semibold text-gray-700">
          Goal
        </label>
        <select
          id="activity-goal-select"
          className="select-field"
          value={form.goalId || ''}
          onChange={(event) => setForm({ ...form, goalId: Number(event.target.value) })}
          required
        >
          <option value="">Select goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="activity-date-input" className="mb-1 block text-sm font-semibold text-gray-700">
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
          <label htmlFor="activity-minutes-input" className="mb-1 block text-sm font-semibold text-gray-700">
            Minutes
          </label>
          <input
            id="activity-minutes-input"
            type="number"
            className="input-field"
            min={10}
            max={600}
            value={form.minutesSpent}
            onChange={(event) => setForm({ ...form, minutesSpent: Number(event.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="activity-notes-input" className="mb-1 block text-sm font-semibold text-gray-700">
          Notes
        </label>
        <textarea
          id="activity-notes-input"
          className="textarea-field"
          rows={3}
          value={form.notes || ''}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="What did you work on?"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Activity'}
      </button>
    </form>
  );
};

export default ActivityForm;
