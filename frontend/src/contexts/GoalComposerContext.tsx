import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchDashboard } from '../store/dashboardSlice';
import GoalComposerForm from '../components/Goals/GoalComposerForm';
import Modal from '../components/ui/Modal';

interface GoalComposerContextValue {
  openGoalComposer: () => void;
  closeGoalComposer: () => void;
}

const GoalComposerContext = createContext<GoalComposerContextValue>({
  openGoalComposer: () => {},
  closeGoalComposer: () => {},
});

export const GoalComposerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);

  const openGoalComposer = useCallback(() => {
    setOpen(true);
  }, []);

  const closeGoalComposer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleCreated = useCallback(async () => {
    await dispatch(fetchDashboard());
    setOpen(false);
  }, [dispatch]);

  const value = useMemo(
    () => ({
      openGoalComposer,
      closeGoalComposer,
    }),
    [closeGoalComposer, openGoalComposer]
  );

  return (
    <GoalComposerContext.Provider value={value}>
      {children}

      <Modal open={open} onClose={closeGoalComposer} maxWidth="md">
        <GoalComposerForm mode="modal" onCancel={closeGoalComposer} onCreated={handleCreated} />
      </Modal>
    </GoalComposerContext.Provider>
  );
};

export const useGoalComposer = () => useContext(GoalComposerContext);

export default GoalComposerContext;
