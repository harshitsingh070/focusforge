import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store';
import Navbar from '../Layout/Navbar';
import LogActivityModal from '../Activity/LogActivityModal';

const LogActivity: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useSelector((state: RootState) => state.dashboard);

  const goal = useMemo(() => {
    if (!id) {
      return undefined;
    }
    return data?.activeGoals.find((item) => item.goalId === Number(id));
  }, [data, id]);

  if (!id) {
    navigate('/dashboard');
    return null;
  }

  if (!goal) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container max-w-3xl">
          <div className="card text-center">
            <h2 className="text-xl font-semibold text-gray-900">Goal not found in active dashboard goals</h2>
            <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="page-container">
        <LogActivityModal
          goalId={goal.goalId}
          goalTitle={goal.title}
          dailyTarget={goal.dailyTarget}
          onClose={() => navigate('/dashboard')}
        />
      </main>
    </div>
  );
};

export default LogActivity;
