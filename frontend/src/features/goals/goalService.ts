import { api } from "../../services/api";
import {
  CreateGoalRequest,
  Goal,
  UpdateGoalRequest,
  GoalStatus,
} from "./types";

/**
 * 🔐 NOTE:
 * We rely on api.ts interceptor / default header
 * DO NOT modify api.ts (as per your instruction)
 */

export const createGoal = async (
  payload: CreateGoalRequest
): Promise<Goal> => {
  const response = await api.post<Goal>("/goals", payload);
  return response.data;
};

export const getMyGoals = async (): Promise<Goal[]> => {
  const response = await api.get<Goal[]>("/goals");
  return response.data;
};

export const updateGoal = async (
  id: number,
  data: UpdateGoalRequest
): Promise<Goal> => {
  const response = await api.put<Goal>(`/goals/${id}`, data);
  return response.data;
};

// ✅ COMPLETE GOAL
export const completeGoal = async (id: number): Promise<Goal> => {
  const response = await api.patch<Goal>(
    `/goals/${id}/status`,
    { status: "COMPLETED" }
  );
  return response.data;
};

// ✅ ARCHIVE / DEACTIVATE GOAL
export const deactivateGoal = async (id: number): Promise<Goal> => {
  const response = await api.patch<Goal>(
    `/goals/${id}/status`,
    { status: "ARCHIVED" }
  );
  return response.data;
};
