import React from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ConfirmDeleteGoalModalProps {
  goalTitle: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteGoalModal: React.FC<ConfirmDeleteGoalModalProps> = ({
  goalTitle,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const handleClose = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Modal open onClose={handleClose} title="Delete Goal?" maxWidth="md">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            borderColor: 'var(--ff-ui-danger-border)',
            background: 'linear-gradient(180deg, var(--ff-ui-danger-top), var(--ff-ui-danger-bottom))',
            color: 'var(--ff-ui-danger-text)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 22px rgba(127,29,29,0.12)',
          }}
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-6" style={{ color: 'var(--ff-ui-text-soft)' }}>
            Are you sure you want to delete{' '}
            <span className="font-semibold" style={{ color: 'var(--ff-ui-text)' }}>
              "{goalTitle}"
            </span>
            ?
          </p>
          <p className="mt-2 text-xs leading-5" style={{ color: 'var(--ff-ui-text-muted)' }}>
            This will deactivate the goal and remove it from your dashboard.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} loading={loading} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete Goal'}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteGoalModal;
