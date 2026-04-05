import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FeedbackRewardInput, FeedbackToastInput } from '../types/feedback';

interface FeedbackToastItem extends FeedbackToastInput {
  id: string;
  exiting: boolean;
}

interface FeedbackRewardItem extends FeedbackRewardInput {
  id: string;
}

interface FeedbackContextValue {
  pushToast: (toast: FeedbackToastInput) => void;
  showReward: (reward: FeedbackRewardInput) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 4;
const DEFAULT_TOAST_DURATION_MS = 2800;
const DEFAULT_REWARD_DURATION_MS = 3400;
const TOAST_EXIT_MS = 140;

const createFeedbackId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener?.('change', updatePreference);

    return () => {
      media.removeEventListener?.('change', updatePreference);
    };
  }, []);

  return prefersReducedMotion;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [toasts, setToasts] = useState<FeedbackToastItem[]>([]);
  const [rewardQueue, setRewardQueue] = useState<FeedbackRewardItem[]>([]);
  const [activeReward, setActiveReward] = useState<FeedbackRewardItem | null>(null);
  const rewardTimerRef = useRef<number | null>(null);

  const dismissToast = useCallback(
    (toastId: string, immediate = false) => {
      if (immediate || prefersReducedMotion) {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
        return;
      }

      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === toastId
            ? {
                ...toast,
                exiting: true,
              }
            : toast
        )
      );

      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
      }, TOAST_EXIT_MS);
    },
    [prefersReducedMotion]
  );

  const pushToast = useCallback(
    (toast: FeedbackToastInput) => {
      const toastId = createFeedbackId();
      const durationMs = Math.max(1800, toast.durationMs ?? DEFAULT_TOAST_DURATION_MS);

      setToasts((currentToasts) => {
        const nextToasts = [
          ...currentToasts,
          {
            ...toast,
            id: toastId,
            exiting: false,
          },
        ];

        return nextToasts.slice(-MAX_VISIBLE_TOASTS);
      });

      window.setTimeout(() => {
        dismissToast(toastId);
      }, durationMs);
    },
    [dismissToast]
  );

  const dismissActiveReward = useCallback(() => {
    if (rewardTimerRef.current) {
      window.clearTimeout(rewardTimerRef.current);
      rewardTimerRef.current = null;
    }

    setActiveReward(null);
  }, []);

  const showReward = useCallback((reward: FeedbackRewardInput) => {
    setRewardQueue((currentQueue) => [
      ...currentQueue,
      {
        ...reward,
        id: createFeedbackId(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (activeReward || rewardQueue.length === 0) {
      return;
    }

    const [nextReward, ...remainingRewards] = rewardQueue;
    setActiveReward(nextReward);
    setRewardQueue(remainingRewards);
  }, [activeReward, rewardQueue]);

  useEffect(() => {
    if (!activeReward) {
      return;
    }

    rewardTimerRef.current = window.setTimeout(
      () => dismissActiveReward(),
      Math.max(2200, activeReward.durationMs ?? DEFAULT_REWARD_DURATION_MS)
    );

    return () => {
      if (rewardTimerRef.current) {
        window.clearTimeout(rewardTimerRef.current);
        rewardTimerRef.current = null;
      }
    };
  }, [activeReward, dismissActiveReward]);

  const contextValue = useMemo<FeedbackContextValue>(
    () => ({
      pushToast,
      showReward,
    }),
    [pushToast, showReward]
  );

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}

      <div className="ff-feedback-layer" aria-live="polite" aria-atomic="false">
        {activeReward && (
          <div className="ff-feedback-reward-wrap">
            <section
              className="ff-feedback-reward"
              data-tone={activeReward.tone || 'violet'}
              role="status"
            >
              <div className="ff-feedback-reward__icon">
                <span className="material-symbols-outlined text-[26px]">
                  {activeReward.icon || 'celebration'}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {activeReward.eyebrow && (
                  <p className="ff-feedback-reward__eyebrow">{activeReward.eyebrow}</p>
                )}
                <h3 className="ff-feedback-reward__title">{activeReward.title}</h3>
                <p className="ff-feedback-reward__message">{activeReward.message}</p>

                {(activeReward.statLabel || activeReward.statValue) && (
                  <div className="ff-feedback-reward__meta">
                    <span>{activeReward.statLabel || 'Progress'}</span>
                    <strong>{activeReward.statValue || ''}</strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="ff-feedback-reward__dismiss"
                onClick={dismissActiveReward}
                aria-label="Dismiss reward popup"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </section>
          </div>
        )}

        <div className="ff-feedback-toast-stack">
          {toasts.map((toast) => (
            <article
              key={toast.id}
              className={`ff-toast ff-feedback-toast ${toast.exiting ? 'ff-toast-exit' : ''}`}
              data-tone={toast.tone || 'slate'}
              role="status"
            >
              <div className="ff-feedback-toast__icon">
                <span className="material-symbols-outlined text-[18px]">{toast.icon || 'info'}</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="ff-feedback-toast__title">{toast.title}</p>
                {toast.message && <p className="ff-feedback-toast__message">{toast.message}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }

  return context;
};

export default FeedbackContext;
