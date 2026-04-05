import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

export const goalCategories = [
  { id: 1, name: 'Coding',       color: '#0f766e' },
  { id: 2, name: 'Health',       color: '#10b981' },
  { id: 3, name: 'Reading',      color: '#ea580c' },
  { id: 4, name: 'Academics',    color: '#2563eb' },
  { id: 5, name: 'Career Skills',color: '#be185d' },
];

const difficultyLabels: Record<number, string> = {
  1: 'Very Easy', 2: 'Easy', 3: 'Balanced', 4: 'Hard', 5: 'Very Hard',
};

interface GoalComposerFormProps {
  mode?: 'page' | 'modal';
  onCancel: () => void;
  onCreated?: () => void | Promise<void>;
}

const GoalComposerForm: React.FC<GoalComposerFormProps> = ({ mode = 'modal', onCancel, onCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const selectedCategory = useMemo(
    () => goalCategories.find((c) => c.id === formData.categoryId) || goalCategories[0],
    [formData.categoryId]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await dispatch(createGoal({ ...formData, endDate: formData.endDate || undefined })).unwrap();
      if (onCreated) { await onCreated(); return; }
    } catch (err: any) {
      setError(err || 'Failed to create goal');
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const inputCls =
    'w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] ' +
    'bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2.5 text-sm ' +
    'text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors ' +
    'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 ' +
    'placeholder:text-[var(--ff-dashboard-text-muted,var(--ff-text-500))]';

  const labelCls = `mb-1.5 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`;

  return (
    <div className={`${styles.dashboardThemeScope} ${mode === 'page' ? 'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8' : ''}`}>
      {mode === 'page' && (
        <button type="button" onClick={onCancel}
          className={`mb-5 flex items-center gap-1.5 text-sm font-medium ${styles.dashboardGoalMeta} hover:text-violet-400`}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back
        </button>
      )}

      {/* ── Header ── */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>New Goal</span>
          <span className={styles.dashboardStatusChip}
            style={{ background: `${selectedCategory.color}1c`, color: selectedCategory.color, borderColor: `${selectedCategory.color}40` }}>
            {selectedCategory.name}
          </span>
          <span className={styles.dashboardStatusChip}
            style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.2)' }}>
            {difficultyLabels[formData.difficulty]}
          </span>
        </div>
        {mode === 'page' && (
          <h1 className={`text-xl font-bold tracking-tight ${styles.dashboardGoalTitle}`}>Create New Goal</h1>
        )}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}
        className={mode === 'page' ? `${styles.dashboardPanelCard} rounded-2xl p-5 space-y-4` : 'space-y-4'}>

        {error && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {/* ── Category ── */}
        <div>
          <label className={labelCls}>Category <span className="text-rose-400">*</span></label>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {goalCategories.map((cat) => {
              const active = formData.categoryId === cat.id;
              return (
                <button key={cat.id} type="button"
                  onClick={() => setFormData((f) => ({ ...f, categoryId: cat.id }))}
                  className={`min-h-[44px] rounded-xl border px-2 py-2 text-center text-[11px] font-semibold leading-tight transition-all sm:text-xs ${active ? 'text-white ring-1 ring-white/20' : `${styles.dashboardGoalMeta} border-[var(--ff-dashboard-card-border,var(--ff-border))] hover:border-violet-400`}`}
                  style={active ? { backgroundColor: cat.color, borderColor: 'transparent' }
                    : { background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' }}>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Title ── */}
        <div>
          <label htmlFor="goal-title" className={labelCls}>Goal Title <span className="text-rose-400">*</span></label>
          <input id="goal-title" type="text"
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Learn React fundamentals"
            className={inputCls} required />
        </div>

        {/* ── Description ── */}
        <div>
          <label htmlFor="goal-desc" className={labelCls}>Description</label>
          <textarea id="goal-desc"
            value={formData.description}
            onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            placeholder="What do you want to achieve?"
            rows={2}
            className={`${inputCls} resize-none`} />
        </div>

        {/* ── Daily Minutes + Difficulty (2-col) ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="daily-mins" className={labelCls}>Daily Minutes <span className="text-rose-400">*</span></label>
            <input id="daily-mins" type="number"
              value={formData.dailyMinimumMinutes}
              onChange={(e) => setFormData((f) => ({ ...f, dailyMinimumMinutes: Math.max(10, Math.min(600, parseInt(e.target.value) || 10)) }))}
              min="10" max="600" step="5"
              className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Difficulty <span className="text-rose-400">*</span></label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button key={level} type="button"
                  onClick={() => setFormData((f) => ({ ...f, difficulty: level }))}
                  className={`rounded-lg border py-2 text-xs font-bold transition-all ${formData.difficulty === level
                    ? 'border-violet-500 bg-violet-500/15 text-violet-400'
                    : `${styles.dashboardGoalMeta} border-[var(--ff-dashboard-card-border,var(--ff-border))] hover:border-violet-400`}`}
                  style={formData.difficulty !== level ? { background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' } : {}}>
                  {level}
                </button>
              ))}
            </div>
            <p className={`mt-1 text-[10px] ${styles.dashboardGoalMeta}`}>{formData.difficulty} — {difficultyLabels[formData.difficulty]}</p>
          </div>
        </div>

        {/* ── Start + End Date (2-col) ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="start-date" className={labelCls}>Start Date <span className="text-rose-400">*</span></label>
            <input id="start-date" type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
              className={inputCls} required />
          </div>
          <div>
            <label htmlFor="end-date" className={labelCls}>
              End Date <span className={`font-normal normal-case tracking-normal ${styles.dashboardGoalMeta}`}>(opt.)</span>
            </label>
            <input id="end-date" type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
              min={formData.startDate}
              className={inputCls} />
          </div>
        </div>

        {/* ── Public toggle ── */}
        <div className={`${styles.dashboardGoalCard} rounded-xl p-3.5`}
          style={!formData.isPrivate ? { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' } : {}}>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox"
              checked={!formData.isPrivate}
              onChange={(e) => setFormData((f) => ({ ...f, isPrivate: !e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 accent-violet-500" />
            <div>
              <span className={`text-sm font-semibold ${styles.dashboardGoalTitle}`}>Make goal public</span>
              <p className={`text-xs ${styles.dashboardGoalMeta}`}
                style={!formData.isPrivate ? { color: '#6ee7b7' } : {}}>
                {!formData.isPrivate ? 'Appears on category leaderboards' : 'Visible only to you'}
              </p>
            </div>
          </label>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <button type="button" onClick={onCancel} disabled={loading}
            className={`${styles.dashboardGoalButtonSecondary} flex-1`}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className={`${styles.dashboardGoalButtonPrimary} flex flex-1 items-center justify-center gap-2`}>
            {loading
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Creating…</>
              : <><span className="material-symbols-outlined text-[18px]">add_circle</span> Create Goal</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalComposerForm;
