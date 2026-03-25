import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logActivity } from '../../store/activitySlice';
import { fetchDashboard } from '../../store/dashboardSlice';
import { ActivityLog, ActivityRequest, BadgeAward } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

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

  /* shared input class */
  const inputCls =
    'w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] ' +
    'bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2.5 text-sm ' +
    'text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors ' +
    'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 ' +
    'placeholder:text-[var(--ff-dashboard-text-muted,var(--ff-text-500))]';

  const labelCls = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 sm:items-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      {/* Modal panel */}
      <div
        className={`${styles.dashboardThemeScope} ${styles.dashboardPanelCard} max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-5 sm:rounded-2xl`}
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>Log Activity</h2>
            <p className={`mt-0.5 truncate text-sm ${styles.dashboardGoalMeta}`}>{goalTitle}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
                Target: {maxMinutesAllowed}m
              </span>
              <span className={`${styles.dashboardStatusChip} ${remainingMinutes > 0 ? styles.dashboardStatusChipFocus : styles.dashboardStatusChipActive}`}>
                {remainingMinutes > 0 ? `${remainingMinutes}m remaining` : '✓ Target reached'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={`${styles.dashboardGoalButtonSecondary} shrink-0 !px-2 !py-2`}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className={`${styles.dashboardGoalTrack} mb-5 h-2`}>
          <div
            className={styles.dashboardGoalFill}
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                : 'linear-gradient(90deg,#7c3aed,#8b5cf6)',
            }}
          />
        </div>

        {(localError || error) && (
          <div className="mb-4 rounded-xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label htmlFor="activity-date" className={labelCls}>
              Date <span className="text-rose-400">*</span>
            </label>
            <input
              id="activity-date"
              type="date"
              value={formData.logDate}
              onChange={(e) => { setFormData({ ...formData, logDate: e.target.value }); if (localError) setLocalError(null); }}
              max={todayIso}
              className={inputCls}
              required
            />
            <p className={`mt-1 text-xs ${styles.dashboardGoalMeta}`}>Future dates are not allowed.</p>
          </div>

          {/* Minutes */}
          <div>
            <label htmlFor="minutes" className={labelCls}>
              Time Spent (minutes) <span className="text-rose-400">*</span>
            </label>
            <input
              id="minutes"
              type="number"
              value={formData.minutesSpent}
              onChange={(e) => setMinutesSpent(parseInt(e.target.value, 10) || 0)}
              min="10"
              max={maxMinutesAllowed}
              step="5"
              className={inputCls}
              required
            />
            <p className={`mt-1 text-xs ${styles.dashboardGoalMeta}`}>
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
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      sel
                        ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300'
                        : `border-[var(--ff-dashboard-card-border,var(--ff-border))] ${styles.dashboardGoalMeta} hover:border-violet-400`
                    }`}
                    style={!sel ? { background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' } : {}}
                  >
                    {m}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={labelCls}>
              Notes <span className={`font-normal ${styles.dashboardGoalMeta}`}>(optional)</span>
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="What did you work on?"
              rows={3}
              maxLength={280}
              className={`${inputCls} resize-none`}
            />
            <p className={`mt-1 text-right text-xs ${styles.dashboardGoalMeta}`}>
              {(formData.notes || '').length}/280
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className={`${styles.dashboardGoalButtonSecondary} flex-1`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.dashboardGoalButtonPrimary} flex flex-1 items-center justify-center gap-2`}
              disabled={loading || !isMinutesValid}
            >
              {loading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Logging…</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">add_circle</span> Log Activity</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;
