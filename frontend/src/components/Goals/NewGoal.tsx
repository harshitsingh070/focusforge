import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalComposer } from '../../contexts/GoalComposerContext';

const NewGoal: React.FC = () => {
  const navigate = useNavigate();
  const { openGoalComposer } = useGoalComposer();

  useEffect(() => {
    openGoalComposer();
    navigate('/goals', { replace: true });
  }, [navigate, openGoalComposer]);

  return null;
};

export default NewGoal;
