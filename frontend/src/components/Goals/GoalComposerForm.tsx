import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';
import Button from '../ui/Button';

export const goalCategories = [
  { id: 1, name: 'Coding', color: '#0f766e' },
  { id: 2, name: 'Health', color: '#10b981' },
  { id: 3, name: 'Reading', color: '#ea580c' },
  { id: 4, name: 'Academics', color: '#2563eb' },
  { id: 5, name: 'Career Skills', color: '#be185d' },
];

const difficultyLabels: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Balanced',
  4: 'Hard',
  5: 'Very Hard',
};

const minutePresets = [10, 15, 20, 30, 45, 60, 90, 120];

interface GoalComposerFormProps {
  mode?: 'page' | 'modal';
  onCancel: () => void;
  onCreated?: () => void | Promise<void>;
}

const GoalComposerForm: React.FC<GoalComposerFormProps> = ({ mode = 'modal', onCancel, onCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isModal = mode === 'modal';
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
    () => goalCategories.find((category) => category.id === formData.categoryId) || goalCategories[0],
    [formData.categoryId]
  );

  const setDailyMinutes = (value: number) => {
    setFormData((current) => ({
      ...current,
      dailyMinimumMinutes: Math.max(0, Math.min(600, value)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dispatch(
        createGoal({
          ...formData,
          endDate: formData.endDate || undefined,
        })
      ).unwrap();

      if (onCreated) {
        await onCreated();
        return;
      }
    } catch (err: any) {
      setError(err || 'Failed to create goal');
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className={mode === 'page' ? 'mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10' : ''}>
      {mode === 'page' && (
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[var(--ff-text-700)] transition-colors hover:text-[var(--ff-text-900)]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
      )}

      <div className={mode === 'page' ? 'mb-6' : 'mb-4'}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(124,58,237,0.1)] px-3 py-0.5 text-xs font-semibold text-[var(--ff-primary)]">Goal Setup</span>
          <span className="status-chip" style={{ background: `${selectedCategory.color}1c`, color: selectedCategory.color }}>
            {selectedCategory.name}
          </span>
          <span className="status-chip" style={{ background: 'rgba(59,130,246,0.14)', color: '#1d4ed8' }}>
            {difficultyLabels[formData.difficulty]}
          </span>
          <span className="status-chip" style={{ background: 'rgba(249,115,22,0.15)', color: '#c2410c' }}>
            {formData.dailyMinimumMinutes} min/day
          </span>
        </div>

        {mode === 'page' ? (
          <>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--ff-text-900)]">Create New Goal</h1>
            <p className="mt-1 text-sm text-[var(--ff-text-700)]">Set a daily target and keep your momentum visible.</p>
          </>
        ) : (
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300">
            Build a new goal without leaving the current screen.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${mode === 'page' ? 'rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2' : 'space-y-4'}`}
      >
        {error && (
          <div className="rounded-xl border border-rose-300/50 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {goalCategories.map((cat) => {
              const active = formData.categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, categoryId: cat.id }))}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    active
                      ? 'border-transparent text-white shadow-soft ring-2 ring-offset-1 ring-white/85'
                      : 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                  }`}
                  style={active ? { backgroundColor: cat.color } : {}}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid ${isModal ? 'gap-3.5' : 'gap-4'} sm:grid-cols-2`}>
          <div className="sm:col-span-2">
            <label htmlFor="goal-title" className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
              placeholder="Example: Learn React fundamentals"
              className="input-field"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="goal-description" className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              Description
            </label>
            <textarea
              id="goal-description"
              value={formData.description}
              onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
              placeholder="What do you want to achieve?"
              rows={isModal ? 3 : 4}
              className="textarea-field"
            />
          </div>

          <div>
            <label htmlFor="daily-commitment" className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              Daily Commitment (minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              id="daily-commitment"
              type="number"
              value={formData.dailyMinimumMinutes}
              onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10) || 0)}
              min="10"
              max="600"
              step="5"
              className="input-field"
              required
            />
            <p className="mt-1 text-xs text-[var(--ff-text-500)]">Choose between 10 and 600 minutes.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {minutePresets
                .filter((minutes) => minutes <= 600)
                .map((minutes) => {
                  const active = formData.dailyMinimumMinutes === minutes;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDailyMinutes(minutes)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[var(--ff-primary)] bg-[rgba(124,58,237,0.1)] text-[var(--ff-primary)]'
                          : 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                      }`}
                    >
                      {minutes}m
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              Difficulty Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, difficulty: level }))}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-all ${
                    formData.difficulty === level
                      ? 'border-[var(--ff-primary)] bg-[rgba(124,58,237,0.1)] text-[var(--ff-primary)]'
                      : 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs font-semibold text-[var(--ff-text-700)]">
              {formData.difficulty} - {difficultyLabels[formData.difficulty]}
            </p>
          </div>

          <div>
            <label htmlFor="start-date" className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((current) => ({ ...current, startDate: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="end-date" className="mb-2 block text-sm font-semibold text-[var(--ff-text-900)]">
              End Date <span className="font-normal text-[var(--ff-text-500)]">(Optional)</span>
            </label>
            <input
              id="end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((current) => ({ ...current, endDate: e.target.value }))}
              min={formData.startDate}
              className="input-field"
            />
          </div>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            formData.isPrivate
              ? 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)]'
              : 'border-emerald-200 bg-emerald-50'
          }`}
          style={isModal ? { padding: '0.9rem 1rem' } : undefined}
        >
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!formData.isPrivate}
              onChange={(e) => setFormData((current) => ({ ...current, isPrivate: !e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm font-semibold text-[var(--ff-text-900)]">
              Make this goal public (appear on leaderboards)
            </span>
          </label>
          <p className={`ml-7 mt-1.5 text-sm ${formData.isPrivate ? 'text-[var(--ff-text-700)]' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {!formData.isPrivate
              ? 'This goal will be visible on category leaderboards.'
              : 'This goal stays private and visible only to you.'}
          </p>
        </div>

        <div className={`flex flex-col gap-3 ${isModal ? 'pt-0' : 'pt-1'} sm:flex-row`}>
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={loading} icon={loading ? undefined : 'add_circle'}>
            {loading ? 'Creating…' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GoalComposerForm;
