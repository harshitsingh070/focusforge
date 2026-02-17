import React, { useMemo, useState } from 'react';
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
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [formData, setFormData] = useState<ActivityRequest>({
    goalId,
    logDate: todayIso,
    minutesSpent: Math.min(30, maxMinutesAllowed),
    notes: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const quickMinuteOptions = useMemo(
    () =>
      Array.from(new Set([10, 15, 20, 30, 45, 60, maxMinutesAllowed]))
        .filter((minutes) => minutes <= maxMinutesAllowed)
        .sort((a, b) => a - b),
    [maxMinutesAllowed]
  );

  const progressPercent = Math.max(0, Math.min(100, Math.round((formData.minutesSpent / maxMinutesAllowed) * 100)));
  const remainingMinutes = Math.max(0, maxMinutesAllowed - formData.minutesSpent);
  const isMinutesValid = formData.minutesSpent >= 10 && formData.minutesSpent <= maxMinutesAllowed;

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

  const setMinutesSpent = (minutes: number) => {
    const safeValue = Math.max(0, Math.min(600, Number.isNaN(minutes) ? 0 : minutes));
    setFormData((prev) => ({ ...prev, minutesSpent: safeValue }));
    if (localError) {
      setLocalError(null);
    }
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Log Activity</h2>
            <p className="text-sm text-ink-muted">Goal: {goalTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="status-chip" style={{ background: 'rgba(59,130,246,0.14)', color: '#1d4ed8' }}>
                Daily target: {maxMinutesAllowed}m
              </span>
              <span
                className="status-chip"
                style={{ background: remainingMinutes > 0 ? 'rgba(249,115,22,0.16)' : 'rgba(34,197,94,0.14)', color: remainingMinutes > 0 ? '#c2410c' : '#15803d' }}
              >
                {remainingMinutes > 0 ? `${remainingMinutes}m remaining` : 'Target reached'}
              </span>
            </div>
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
              onChange={(event) => {
                setFormData({ ...formData, logDate: event.target.value });
                if (localError) {
                  setLocalError(null);
                }
              }}
              max={todayIso}
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
              onChange={(event) => setMinutesSpent(parseInt(event.target.value, 10) || 0)}
              min="10"
              max={maxMinutesAllowed}
              step="5"
              className="input-field"
              required
            />
            <p className="mt-1 text-xs text-ink-muted">Allowed range: 10 to {maxMinutesAllowed} minutes.</p>
            <div className="mt-2">
              <div className="ff-progress">
                <span style={{ width: `${progressPercent}%`, background: progressPercent >= 100 ? 'linear-gradient(90deg, #34d399, #22c55e)' : 'linear-gradient(90deg, #60a5fa, #6366f1)' }} />
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">{progressPercent}% of daily target</p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {quickMinuteOptions.map((minutes) => {
                const isSelected = formData.minutesSpent === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setMinutesSpent(minutes)}
                    className={`rounded-full px-2 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border border-blue-300 bg-blue-50 text-blue-700'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {minutes}m
                  </button>
                );
              })}
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
              maxLength={280}
              className="textarea-field"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{(formData.notes || '').length}/280</p>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !isMinutesValid}>
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;
