import CreateGoalForm from "../features/goals/CreateGoalForm";
import GoalList from "../features/goals/GoalList";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p>Please login or register to manage your goals.</p>
    </div>
  );
}
