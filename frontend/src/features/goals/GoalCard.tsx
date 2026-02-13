import { Goal } from "./goalTypes";

interface Props {
  goal: Goal;
}

export default function GoalCard({ goal }: Props) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <h3 className="font-bold text-lg">{goal.category}</h3>

      <p>Difficulty: {goal.difficulty}</p>
      <p>Status: {goal.status}</p>
      <p>Visibility: {goal.visibility}</p>

      <p>
        Duration: {goal.startDate} → {goal.endDate}
      </p>

      <p>Daily Effort: {goal.dailyMinimumEffort}</p>
    </div>
  );
}
