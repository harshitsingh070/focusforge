import { Badge, DashboardData, GoalProgress, RecentActivity } from '../types';

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayLabel = (typeof dayOrder)[number];

const weekdayAliases: Record<string, DayLabel> = {
  mon: 'Mon',
  monday: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  wed: 'Wed',
  weds: 'Wed',
  wednesday: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  sun: 'Sun',
  sunday: 'Sun',
};

const DEFAULT_COLOR = '#895AF6';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const toNonNegativeInt = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.round(parsed));
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
};

const toDateString = (value: unknown): string => {
  const candidate = toTrimmedString(value);
  if (!candidate) {
    return '';
  }

  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
};

const isValidCssColor = (value: string): boolean =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ||
  /^rgb(a)?\(/.test(value) ||
  /^hsl(a)?\(/.test(value) ||
  /^var\(--/.test(value);

const sanitizeColor = (value: unknown, fallback = DEFAULT_COLOR): string => {
  const candidate = toTrimmedString(value, fallback);
  return isValidCssColor(candidate) ? candidate : fallback;
};

const normalizeDayLabel = (input: string): DayLabel | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.toLowerCase();
  if (weekdayAliases[normalized]) {
    return weekdayAliases[normalized];
  }

  const alphaOnly = normalized.replace(/[^a-z]/g, '');
  if (alphaOnly.length >= 3 && weekdayAliases[alphaOnly.slice(0, 3)]) {
    return weekdayAliases[alphaOnly.slice(0, 3)];
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    return dayOrder[(parsedDate.getDay() + 6) % 7];
  }

  return null;
};

const sanitizeWeeklyProgress = (value: unknown): Record<string, number> => {
  const normalized = new Map<DayLabel, number>(dayOrder.map((day) => [day, 0]));

  if (isRecord(value)) {
    Object.entries(value).forEach(([label, minutes]) => {
      const day = normalizeDayLabel(label);
      if (!day) {
        return;
      }
      normalized.set(day, toNonNegativeInt(minutes));
    });
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      const safeEntry = isRecord(entry) ? entry : {};
      const labelCandidate = toTrimmedString(
        safeEntry.label ?? safeEntry.day ?? safeEntry.date ?? safeEntry.weekday
      );
      const day = normalizeDayLabel(labelCandidate);
      if (!day) {
        return;
      }
      normalized.set(day, toNonNegativeInt(safeEntry.minutes ?? safeEntry.total ?? safeEntry.value));
    });
  }

  return dayOrder.reduce<Record<string, number>>((acc, day) => {
    acc[day] = normalized.get(day) ?? 0;
    return acc;
  }, {});
};

const sanitizeGoalProgress = (value: unknown, fallbackIndex: number): GoalProgress => {
  const raw = isRecord(value) ? value : {};
  const todayProgress = toNonNegativeInt(raw.todayProgress);
  const dailyTarget = Math.max(1, toNonNegativeInt(raw.dailyTarget, 1));
  const completedToday = toBoolean(raw.completedToday, todayProgress > 0);
  const currentStreak = toNonNegativeInt(raw.currentStreak);
  const longestStreak = Math.max(currentStreak, toNonNegativeInt(raw.longestStreak, currentStreak));

  return {
    goalId: Math.max(1, toNonNegativeInt(raw.goalId, fallbackIndex + 1)),
    title: toTrimmedString(raw.title, 'Untitled Goal'),
    category: toTrimmedString(raw.category, 'General'),
    categoryColor: sanitizeColor(raw.categoryColor),
    currentStreak,
    longestStreak,
    dailyTarget,
    todayProgress,
    completedToday,
    atRisk: completedToday ? false : toBoolean(raw.atRisk),
  };
};

const sanitizeRecentActivity = (value: unknown, fallbackIndex: number): RecentActivity => {
  const raw = isRecord(value) ? value : {};

  return {
    id: Math.max(1, toNonNegativeInt(raw.id, fallbackIndex + 1)),
    goalTitle: toTrimmedString(raw.goalTitle, 'Goal Activity'),
    categoryColor: sanitizeColor(raw.categoryColor),
    minutes: toNonNegativeInt(raw.minutes),
    date: toDateString(raw.date),
    points:
      raw.points === undefined || raw.points === null
        ? undefined
        : toNonNegativeInt(raw.points),
  };
};

const sanitizeBadge = (value: unknown, fallbackIndex: number): Badge => {
  const raw = isRecord(value) ? value : {};
  const id = toNonNegativeInt(raw.id, fallbackIndex + 1);

  return {
    id,
    name: toTrimmedString(raw.name, 'New Badge'),
    description: toTrimmedString(raw.description, 'Great progress this week.'),
    category: toTrimmedString(raw.category),
    iconUrl: toTrimmedString(raw.iconUrl),
    pointsBonus: raw.pointsBonus === undefined ? undefined : toNonNegativeInt(raw.pointsBonus),
    earned: raw.earned === undefined ? undefined : toBoolean(raw.earned),
    awardedAt: toDateString(raw.awardedAt) || undefined,
    earnedAt: toDateString(raw.earnedAt) || undefined,
    earnedReason: toTrimmedString(raw.earnedReason),
    currentValue: raw.currentValue === undefined ? undefined : toNonNegativeInt(raw.currentValue),
    requiredValue: raw.requiredValue === undefined ? undefined : Math.max(1, toNonNegativeInt(raw.requiredValue, 1)),
    progressPercentage: raw.progressPercentage === undefined ? undefined : Math.max(0, Math.min(100, toNonNegativeInt(raw.progressPercentage))),
    ruleText: toTrimmedString(raw.ruleText),
  };
};

const toSortTime = (value: string): number => {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const dedupeGoals = (goals: GoalProgress[]): GoalProgress[] => {
  const seen = new Set<number>();
  return goals.filter((goal) => {
    if (seen.has(goal.goalId)) {
      return false;
    }
    seen.add(goal.goalId);
    return true;
  });
};

export const sanitizeDashboardData = (input: unknown): DashboardData => {
  const raw = isRecord(input) ? input : {};

  const activeGoals = dedupeGoals((Array.isArray(raw.activeGoals) ? raw.activeGoals : []).map(sanitizeGoalProgress));
  const recentActivities = (Array.isArray(raw.recentActivities) ? raw.recentActivities : [])
    .map(sanitizeRecentActivity)
    .sort((a, b) => toSortTime(b.date) - toSortTime(a.date));
  const recentBadges = (Array.isArray(raw.recentBadges) ? raw.recentBadges : [])
    .map(sanitizeBadge)
    .sort((a, b) => toSortTime(b.awardedAt || b.earnedAt || '') - toSortTime(a.awardedAt || a.earnedAt || ''));

  const userId = toNonNegativeInt(raw.userId, 0);

  return {
    userId,
    username: toTrimmedString(raw.username, 'User'),
    totalPoints: toNonNegativeInt(raw.totalPoints),
    globalStreak: toNonNegativeInt(raw.globalStreak),
    activeGoals,
    recentActivities,
    recentBadges,
    weeklyProgress: sanitizeWeeklyProgress(raw.weeklyProgress),
    underReview: toBoolean(raw.underReview),
    insight: toTrimmedString(raw.insight, 'Keep going, consistency compounds over time.'),
  };
};
