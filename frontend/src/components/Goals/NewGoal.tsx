import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../store';
import { createGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';
import Navbar from '../Layout/Navbar';

const categories = [
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

const NewGoal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
    () => categories.find((category) => category.id === formData.categoryId) || categories[0],
    [formData.categoryId]
  );

  const setDailyMinutes = (value: number) => {
    setFormData({ ...formData, dailyMinimumMinutes: Math.max(0, Math.min(600, value)) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const goalData = {
        ...formData,
        endDate: formData.endDate || undefined,
      };

      await dispatch(createGoal(goalData)).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err || 'Failed to create goal');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-4xl">
        <section className="section-heading">
          <p className="status-chip">Goal Setup</p>
          <h1 className="section-title mt-3">Create New Goal</h1>
          <p className="section-subtitle">Set a daily target and keep your momentum visible.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
        </section>

        <form onSubmit={handleSubmit} className="card border-white/75 bg-white/92">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const active = formData.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                    className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-all ${
                      active
                        ? 'border-transparent text-white shadow-soft ring-2 ring-offset-1 ring-white/85'
                        : 'border-slate-200 bg-white text-gray-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    style={active ? { backgroundColor: cat.color } : {}}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="goal-title" className="mb-2 block text-sm font-semibold text-gray-700">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Example: Learn React fundamentals"
                className="input-field"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="goal-description" className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                id="goal-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What do you want to achieve?"
                rows={4}
                className="textarea-field"
              />
            </div>

            <div>
              <label htmlFor="daily-commitment" className="mb-2 block text-sm font-semibold text-gray-700">
                Daily Commitment (minutes) <span className="text-red-500">*</span>
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
              <p className="mt-1 text-xs text-ink-muted">Choose between 10 and 600 minutes.</p>
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
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {minutes}m
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-all ${
                      formData.difficulty === level
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-gray-700 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {formData.difficulty} - {difficultyLabels[formData.difficulty]}
              </p>
            </div>

            <div>
              <label htmlFor="start-date" className="mb-2 block text-sm font-semibold text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="end-date" className="mb-2 block text-sm font-semibold text-gray-700">
                End Date (Optional)
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="input-field"
              />
            </div>
          </div>

          <div
            className={`mb-6 rounded-xl border p-4 ${
              formData.isPrivate ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: !e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm font-semibold text-gray-900">
                Make this goal public (appear on leaderboards)
              </span>
            </label>
            <p className={`ml-7 mt-2 text-sm ${formData.isPrivate ? 'text-slate-600' : 'text-emerald-700'}`}>
              {!formData.isPrivate
                ? 'This goal will be visible on category leaderboards.'
                : 'This goal stays private and visible only to you.'}
            </p>
          </div>

          <div className="app-divider flex flex-col gap-3 pt-4 sm:flex-row">
            <button type="button" onClick={handleCancel} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewGoal;
