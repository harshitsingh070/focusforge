import React from 'react';
import { Badge } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface BadgeDetailModalProps {
  badge: Badge;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, isOpen, onClose }) => {
  if (!isOpen) return null;

  const progress = Math.max(0, Math.min(100, badge.progressPercentage || 0));

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`${styles.dashboardThemeScope} relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-wide ${styles.dashboardStatLabel}`}>
                  {badge.category || 'General'}
                </p>
                <h2 className={`mt-1 break-words text-2xl font-bold ${styles.dashboardGoalTitle}`}>
                  {badge.name}
                </h2>
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  badge.earned
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {badge.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          </div>

          {/* Description */}
          {badge.description && (
            <div className="mb-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {badge.description}
              </p>
            </div>
          )}

          {/* Rule Text */}
          {badge.ruleText && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Achievement Rule
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {badge.ruleText}
              </p>
            </div>
          )}

          {/* Earned Section */}
          {badge.earned ? (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                ✨ Unlocked Achievement
              </p>
              {badge.earnedReason && (
                <p className="text-sm text-emerald-600 dark:text-emerald-200 mb-2">
                  {badge.earnedReason}
                </p>
              )}
              {badge.pointsBonus && (
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Bonus: <span className="text-emerald-600 dark:text-emerald-200">+{badge.pointsBonus} points</span>
                </p>
              )}
            </div>
          ) : (
            /* Progress Section */
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">Progress</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {badge.currentValue || 0} / {badge.requiredValue || '-'}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
                  style={{ width: `${Math.max(progress, 4)}%` }}
                />
              </div>
              <p className="mt-2 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                {Math.round(progress)}% Complete
              </p>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default BadgeDetailModal;
