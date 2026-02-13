export interface User {
  id: number;
  email: string;
  username: string;
  token?: string;
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
  name: string;
  description: string;
  iconUrl?: string;
  awardedAt?: string;
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
