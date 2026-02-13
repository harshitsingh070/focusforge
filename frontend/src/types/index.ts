export interface User {
  id: number;
  email: string;
  username: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  type?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  colorCode: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  difficulty: number;
  dailyMinimumMinutes: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isPrivate: boolean;
  currentStreak: number;
  longestStreak: number;
}

export interface ActivityLog {
  id: number;
  goalId: number;
  goalTitle: string;
  logDate: string;
  minutesSpent: number;
  notes?: string;
  pointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  suspicious: boolean;
  message: string;
  newlyEarnedBadges?: BadgeAward[];
}

export interface ActivityFilters {
  goalId?: number;
  from?: string;
  to?: string;
}

export interface BadgeAward {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  earnedReason?: string;
  pointsBonus?: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  metadata?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  weeklySummary: boolean;
  pushEnabled: boolean;
}

export interface DashboardData {
  userId: number;
  username: string;
  totalPoints: number;
  globalStreak: number;
  activeGoals: GoalProgress[];
  recentActivities: RecentActivity[];
  recentBadges: Badge[];
  weeklyProgress: Record<string, number>;
  underReview: boolean;
  insight: string;
}

export interface GoalProgress {
  goalId: number;
  title: string;
  category: string;
  categoryColor: string;
  currentStreak: number;
  longestStreak: number;
  dailyTarget: number;
  todayProgress: number;
  completedToday: boolean;
  atRisk: boolean;
}

export interface RecentActivity {
  id: number;
  goalTitle: string;
  categoryColor: string;
  minutes: number;
  date: string;
  points?: number;
}

export interface Badge {
  id?: number;
  name: string;
  description: string;
  category?: string;
  iconUrl?: string;
  pointsBonus?: number;
  earned?: boolean;
  awardedAt?: string;
  earnedAt?: string;
  earnedReason?: string;
  currentValue?: number;
  requiredValue?: number;
  progressPercentage?: number;
  ruleText?: string;
}

export interface BadgeCollection {
  badges: Badge[];
  totalCount?: number;
  earnedCount?: number;
}

export interface LeaderboardRanking {
  rank?: number;
  userId: number;
  username: string;
  totalPoints?: number;
  category?: string;
  score?: number;
  rawPoints?: number;
  streak?: number;
  daysActive?: number;
}

export interface LeaderboardResponse {
  rankings: LeaderboardRanking[];
  period?: string;
  category?: string;
  categoryName?: string | null;
}

export interface UserRankPosition {
  overallRank?: number | null;
  categoryRanks?: Record<string, number>;
}

export interface AnalyticsWeeklyStat {
  date: string;
  points: number;
  minutes: number;
}

export interface AnalyticsCategoryStat {
  category: string;
  points: number;
  minutes: number;
  percentage: number;
}

export interface AnalyticsStreakPoint {
  date: string;
  streak: number;
}

export interface AnalyticsHeatmapPoint {
  date: string;
  label: string;
  minutes: number;
  points: number;
  level: number;
}

export interface AnalyticsMonthlyTrend {
  month: string;
  points: number;
  goals: number;
  minutes: number;
  activeDays: number;
}

export interface AnalyticsConsistency {
  totalDays: number;
  activeDays: number;
  consistencyRate: number;
  longestStreak: number;
  currentStreak: number;
}

export interface TrustMetrics {
  score: number;
  band: string;
  signalsLast30Days: number;
  signalBreakdown: Record<string, number>;
}

export interface AnalyticsData {
  weeklyProgress: AnalyticsWeeklyStat[];
  categoryBreakdown: AnalyticsCategoryStat[];
  streakHistory: AnalyticsStreakPoint[];
  weeklyHeatmap: AnalyticsHeatmapPoint[];
  trustMetrics: TrustMetrics;
  insights: string[];
  consistencyMetrics: AnalyticsConsistency;
  monthlyTrends: AnalyticsMonthlyTrend[];
}

export interface PrivacySettings {
  showActivity: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showLeaderboard: boolean;
  showBadges: boolean;
  showProgress: boolean;
}

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  emailReminders: boolean;
  weeklySummary: boolean;
}

export interface ProfileSettingsData {
  username: string;
  email: string;
  bio: string;
}

export interface SettingsPayload {
  privacy?: PrivacySettings;
  preferences?: UserPreferences;
  profile?: ProfileSettingsData;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface GoalRequest {
  categoryId: number;
  title: string;
  description?: string;
  difficulty: number;
  dailyMinimumMinutes: number;
  startDate: string;
  endDate?: string;
  isPrivate?: boolean;
}

export interface ActivityRequest {
  goalId: number;
  logDate: string;
  minutesSpent: number;
  notes?: string;
}
