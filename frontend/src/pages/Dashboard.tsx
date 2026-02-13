import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateGoalForm from "../features/goals/CreateGoalForm";
import GoalList from "../features/goals/GoalList";

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [refreshCount, setRefreshCount] = useState(0);

  if (isLoading) {
    return <div className="p-6">Restoring session...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">User: {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CreateGoalForm onSuccess={() => setRefreshCount(c => c + 1)} />
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">My Goals</h2>
          <GoalList refreshTrigger={refreshCount} />
        </div>
      </div>
    </div>
  );
}
