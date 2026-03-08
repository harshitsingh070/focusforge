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
        .filter((m) => m <= maxMinutesAllowed)
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
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return value;
  };

  const setMinutesSpent = (minutes: number) => {
    const safe = Math.max(0, Math.min(600, Number.isNaN(minutes) ? 0 : minutes));
    setFormData((prev) => ({ ...prev, minutesSpent: safe }));
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (formData.minutesSpent < 10 || formData.minutesSpent > maxMinutesAllowed) {
      setLocalError(`Time must be between 10 and ${maxMinutesAllowed} minutes for this goal.`);
      return;
    }

    try {
      const payload: ActivityRequest = { ...formData, logDate: normalizeDateForApi(formData.logDate) };
      const response = (await dispatch(logActivity(payload)).unwrap()) as ActivityLog;
      await dispatch(fetchDashboard());
      if (response.newlyEarnedBadges && response.newlyEarnedBadges.length > 0) {
        onBadgesEarned?.(response.newlyEarnedBadges);
      }
      onClose();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 sm:items-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-5 shadow-e2 sm:rounded-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--ff-text-900)]">Log Activity</h2>
            <p className="mt-0.5 truncate text-sm text-[var(--ff-text-700)]">{goalTitle}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: 'rgba(14,165,233,0.12)', color: '#0369a1' }}
              >
                Target: {maxMinutesAllowed}m
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: remainingMinutes > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                  color: remainingMinutes > 0 ? '#d97706' : '#16a34a',
                }}
              >
                {remainingMinutes > 0 ? `${remainingMinutes}m remaining` : '✓ Target reached'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="shrink-0 rounded-[8px] border border-[var(--ff-border)] p-1.5 text-[var(--ff-text-700)] transition-colors hover:bg-[var(--ff-surface-hover)]"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-[var(--ff-surface-hover)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                : 'var(--ff-gradient-primary, linear-gradient(90deg,#7c3aed,#8b5cf6))',
            }}
          />
        </div>

        {(localError || error) && (
          <div className="mb-4 rounded-xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="activity-date" className="mb-1.5 block text-sm font-semibold text-[var(--ff-text-900)]">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="activity-date"
              type="date"
              value={formData.logDate}
              onChange={(e) => { setFormData({ ...formData, logDate: e.target.value }); if (localError) setLocalError(null); }}
              max={todayIso}
              className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none transition-colors focus:border-[rgba(var(--ff-primary-rgb),0.55)]"
              required
            />
            <p className="mt-1 text-xs text-[var(--ff-text-500)]">Future dates are not allowed.</p>
          </div>

          {/* Minutes */}
          <div>
            <label htmlFor="minutes" className="mb-1.5 block text-sm font-semibold text-[var(--ff-text-900)]">
              Time Spent (minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              id="minutes"
              type="number"
              value={formData.minutesSpent}
              onChange={(e) => setMinutesSpent(parseInt(e.target.value, 10) || 0)}
              min="10"
              max={maxMinutesAllowed}
              step="5"
              className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none transition-colors focus:border-[rgba(var(--ff-primary-rgb),0.55)]"
              required
            />
            <p className="mt-1 text-xs text-[var(--ff-text-500)]">
              {progressPercent}% of daily target · Allowed: 10–{maxMinutesAllowed} min
            </p>

            {/* Quick presets */}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickMinuteOptions.map((m) => {
                const sel = formData.minutesSpent === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutesSpent(m)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${sel
                        ? 'border-[var(--ff-primary)] bg-[rgba(124,58,237,0.1)] text-[var(--ff-primary)]'
                        : 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                      }`}
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold text-[var(--ff-text-900)]">
              Notes <span className="text-[var(--ff-text-500)] font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What did you work on?"
              rows={3}
              maxLength={280}
              className="w-full resize-none rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none transition-colors focus:border-[rgba(var(--ff-primary-rgb),0.55)] placeholder:text-[var(--ff-text-500)]"
            />
            <p className="mt-1 text-right text-xs text-[var(--ff-text-500)]">{(formData.notes || '').length}/280</p>
          </div>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] transition-colors hover:bg-[var(--ff-surface-hover)]"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 transition-[filter,box-shadow] hover:brightness-105 hover:shadow-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !isMinutesValid}
            >
              {loading
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Logging…</>
                : <><span className="material-symbols-outlined text-[18px]">add_circle</span> Log Activity</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;
