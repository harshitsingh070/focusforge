import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById, updateGoal } from '../../store/goalsSlice';
import { GoalRequest } from '../../types';
import Navbar from '../Layout/Navbar';

const EditGoal: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading, error } = useSelector((state: RootState) => state.goals);

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

  useEffect(() => {
    if (id) {
      dispatch(fetchGoalById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedGoal) {
      return;
    }

    setFormData({
      categoryId: 1,
      title: selectedGoal.title,
      description: selectedGoal.description,
      difficulty: selectedGoal.difficulty,
      dailyMinimumMinutes: selectedGoal.dailyMinimumMinutes,
      startDate: selectedGoal.startDate,
      endDate: selectedGoal.endDate || '',
      isPrivate: selectedGoal.isPrivate,
    });
  }, [selectedGoal]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) {
      return;
    }

    const payload: GoalRequest = {
      ...formData,
      endDate: formData.endDate || undefined,
    };

    const result = await dispatch(updateGoal({ id: Number(id), goalRequest: payload }));
    if (updateGoal.fulfilled.match(result)) {
      navigate('/goals');
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container max-w-4xl">
        <section className="section-heading">
          <p className="status-chip">Goal Edit</p>
          <h1 className="section-title mt-3">Edit Goal</h1>
          <p className="section-subtitle">Adjust scope and difficulty to keep progress realistic.</p>
        </section>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label htmlFor="goal-edit-title" className="mb-1 block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              id="goal-edit-title"
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="goal-edit-description" className="mb-1 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="goal-edit-description"
              className="textarea-field"
              rows={4}
              value={formData.description || ''}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-edit-difficulty" className="mb-1 block text-sm font-semibold text-gray-700">
                Difficulty
              </label>
              <input
                id="goal-edit-difficulty"
                type="number"
                min={1}
                max={5}
                className="input-field"
                value={formData.difficulty}
                onChange={(event) => setFormData({ ...formData, difficulty: Number(event.target.value) || 1 })}
              />
            </div>
            <div>
              <label htmlFor="goal-edit-minutes" className="mb-1 block text-sm font-semibold text-gray-700">
                Daily Minutes
              </label>
              <input
                id="goal-edit-minutes"
                type="number"
                min={10}
                max={600}
                className="input-field"
                value={formData.dailyMinimumMinutes}
                onChange={(event) =>
                  setFormData({ ...formData, dailyMinimumMinutes: Number(event.target.value) || 10 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-edit-start-date" className="mb-1 block text-sm font-semibold text-gray-700">
                Start Date
              </label>
              <input
                id="goal-edit-start-date"
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
              />
            </div>
            <div>
              <label htmlFor="goal-edit-end-date" className="mb-1 block text-sm font-semibold text-gray-700">
                End Date
              </label>
              <input
                id="goal-edit-end-date"
                type="date"
                className="input-field"
                value={formData.endDate || ''}
                onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Goal'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditGoal;
