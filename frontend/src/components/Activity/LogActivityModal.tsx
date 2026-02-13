import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logActivity } from '../../store/activitySlice';
import { fetchDashboard } from '../../store/dashboardSlice';
import { ActivityLog, ActivityRequest, BadgeAward } from '../../types';

interface LogActivityModalProps {
  goalId: number;
  goalTitle: string;
  dailyTarget?: number;
  onClose: () => void;
  onBadgesEarned?: (badges: BadgeAward[]) => void;
}

const LogActivityModal: React.FC<LogActivityModalProps> = ({
  goalId,
  goalTitle,
  dailyTarget = 600,
  onClose,
  onBadgesEarned,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.activity);
  const maxMinutesAllowed = Math.max(10, Math.min(600, dailyTarget));

  const [formData, setFormData] = useState<ActivityRequest>({
    goalId,
    logDate: new Date().toISOString().split('T')[0],
    minutesSpent: Math.min(30, maxMinutesAllowed),
    notes: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const normalizeDateForApi = (value: string): string => {
    if (!value) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [day, month, year] = value.split('-');
      return `${year}-${month}-${day}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return value;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (formData.minutesSpent < 10 || formData.minutesSpent > maxMinutesAllowed) {
      setLocalError(`Time must be between 10 and ${maxMinutesAllowed} minutes for this goal.`);
      return;
    }

    try {
      const payload: ActivityRequest = {
        ...formData,
        logDate: normalizeDateForApi(formData.logDate),
      };
      const response = (await dispatch(logActivity(payload)).unwrap()) as ActivityLog;
      await dispatch(fetchDashboard());

      if (response.newlyEarnedBadges && response.newlyEarnedBadges.length > 0) {
        onBadgesEarned?.(response.newlyEarnedBadges);
      }

      onClose();
    } catch (err) {
      // slice sets error
      console.error('Failed to log activity:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Log Activity</h2>
            <p className="text-sm text-ink-muted">Goal: {goalTitle}</p>
            <p className="text-xs text-ink-muted">Daily target limit: {maxMinutesAllowed} minutes</p>
          </div>
          <button onClick={onClose} className="btn-secondary px-3 py-2 text-xs" type="button">
            Close
          </button>
        </div>

        {(localError || error) && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{localError || error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="activity-date" className="mb-2 block text-sm font-semibold text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="activity-date"
              type="date"
              value={formData.logDate}
              onChange={(event) => setFormData({ ...formData, logDate: event.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="input-field"
              required
            />
            <p className="mt-1 text-xs text-ink-muted">Future dates are not allowed.</p>
          </div>

          <div>
            <label htmlFor="minutes" className="mb-2 block text-sm font-semibold text-gray-700">
              Time Spent (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="minutes"
              type="number"
              value={formData.minutesSpent}
              onChange={(event) => setFormData({ ...formData, minutesSpent: parseInt(event.target.value, 10) || 0 })}
              min="10"
              max={maxMinutesAllowed}
              className="input-field"
              required
            />
            <p className="mt-1 text-xs text-ink-muted">Allowed range: 10 to {maxMinutesAllowed} minutes.</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[10, 15, 30, 45, 60]
                .filter((minutes) => minutes <= maxMinutesAllowed)
                .map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setFormData({ ...formData, minutesSpent: minutes })}
                    className="btn-secondary px-2 py-2 text-xs"
                  >
                    {minutes}m
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
              placeholder="What did you work on?"
              rows={4}
              className="textarea-field"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;
