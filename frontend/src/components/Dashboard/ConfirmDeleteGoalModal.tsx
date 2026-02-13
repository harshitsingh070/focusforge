import React, { useEffect } from 'react';

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
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [loading, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-4"
      onClick={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-soft sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Delete goal confirmation"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-red-100 text-center text-lg leading-9 text-red-700">
            !
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900">Delete Goal?</h3>
            <p className="mt-1 text-sm text-gray-700">
              Are you sure you want to delete <span className="break-all font-semibold">"{goalTitle}"</span>?
            </p>
            <p className="mt-1 text-xs text-ink-muted">This will deactivate the goal and hide it from your dashboard.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteGoalModal;
