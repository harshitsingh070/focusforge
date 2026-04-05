import { ActivityLog } from '../types';
import { FeedbackRewardInput, FeedbackToastInput } from '../types/feedback';

const LEVEL_STEP_POINTS = 600;
const STREAK_MILESTONES = new Set([3, 7, 14, 21, 30, 50, 75, 100]);

export interface ActivityFeedbackPlan {
  rewards: FeedbackRewardInput[];
  toasts: FeedbackToastInput[];
}

export const getUserLevel = (totalPoints: number) =>
  Math.max(1, Math.floor(Math.max(0, totalPoints) / LEVEL_STEP_POINTS) + 1);

const formatPoints = (points: number) => `${Math.max(0, Math.round(points)).toLocaleString()} XP`;

const isStreakMilestone = (currentStreak: number) =>
  currentStreak > 1 && (STREAK_MILESTONES.has(currentStreak) || currentStreak % 10 === 0);

export const buildActivityFeedback = (activity: ActivityLog, goalTitle?: string): ActivityFeedbackPlan => {
  const safePointsEarned = Math.max(0, Math.round(Number(activity.pointsEarned) || 0));
  const badgeBonus = (activity.newlyEarnedBadges || []).reduce(
    (sum, badge) => sum + Math.max(0, Math.round(Number(badge.pointsBonus) || 0)),
    0
  );
  const previousTotalPoints = Math.max(0, Math.round(Number(activity.totalPoints) || 0) - safePointsEarned - badgeBonus);
  const nextTotalPoints = Math.max(0, Math.round(Number(activity.totalPoints) || 0));
  const previousLevel = getUserLevel(previousTotalPoints);
  const nextLevel = getUserLevel(nextTotalPoints);
  const rewards: FeedbackRewardInput[] = [];
  const toasts: FeedbackToastInput[] = [
    {
      tone: 'emerald',
      icon: 'task_alt',
      title: 'Activity logged',
      message: `${formatPoints(safePointsEarned)} added${goalTitle ? ` for ${goalTitle}` : ''}.`,
    },
  ];

  const firstBadge = activity.newlyEarnedBadges?.[0];
  if (firstBadge) {
    rewards.push({
      tone: 'violet',
      icon: 'military_tech',
      eyebrow: 'Reward Unlocked',
      title: firstBadge.name,
      message: firstBadge.earnedReason || firstBadge.description || 'New badge earned.',
      statLabel: 'Bonus',
      statValue: formatPoints(badgeBonus || safePointsEarned),
    });

    if ((activity.newlyEarnedBadges?.length || 0) > 1) {
      toasts.push({
        tone: 'violet',
        icon: 'emoji_events',
        title: 'Multiple badges earned',
        message: `${activity.newlyEarnedBadges!.length} new rewards were added to your profile.`,
      });
    }
  }

  if (nextLevel > previousLevel) {
    rewards.push({
      tone: 'violet',
      icon: 'rocket_launch',
      eyebrow: 'Level Up',
      title: `Level ${nextLevel} reached`,
      message: `Your total climbed to ${formatPoints(nextTotalPoints)}.`,
      statLabel: 'Previous',
      statValue: `Lv ${previousLevel}`,
    });
  }

  const currentStreak = Math.max(0, Math.round(Number(activity.currentStreak) || 0));
  const longestStreak = Math.max(0, Math.round(Number(activity.longestStreak) || 0));

  if (currentStreak > 1 && (isStreakMilestone(currentStreak) || currentStreak === longestStreak)) {
    rewards.push({
      tone: 'amber',
      icon: 'local_fire_department',
      eyebrow: currentStreak === longestStreak ? 'New Personal Best' : 'Streak Milestone',
      title: `${currentStreak}-day streak`,
      message:
        currentStreak === longestStreak
          ? 'You just set a new streak record. Keep the chain going.'
          : 'Consistency is compounding. Keep showing up tomorrow.',
      statLabel: 'Longest',
      statValue: `${longestStreak}d`,
    });
  }

  return { rewards, toasts };
};
