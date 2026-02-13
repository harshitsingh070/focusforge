export type GoalCategory =
  | "CODING"
  | "HEALTH"
  | "FITNESS"
  | "READING"
  | "ACADEMICS"
  | "CAREER"
  | "PERSONAL_GROWTH";

export type GoalDifficulty = "EASY" | "MEDIUM" | "HARD";

export type GoalVisibility = "PRIVATE" | "PUBLIC";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Goal {
  id: number;
  userId: number;
  category: GoalCategory;
  difficulty: GoalDifficulty;
  startDate: string;
  endDate: string;
  dailyMinimumEffort: number;
  visibility: GoalVisibility;
  status: GoalStatus;
  createdAt: string;
}

export interface CreateGoalRequest {
  category: GoalCategory;
  difficulty: GoalDifficulty;
  startDate: string;
  endDate: string;
  dailyMinimumEffort: number;
  visibility?: GoalVisibility;
}

export interface UpdateGoalRequest {
  difficulty?: GoalDifficulty;
  dailyMinimumEffort?: number;
  visibility?: GoalVisibility;
}
