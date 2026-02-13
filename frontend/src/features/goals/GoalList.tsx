import { useEffect, useState } from "react";
import { getMyGoals, completeGoal, deactivateGoal } from "./goalService";
import { Goal } from "./types";

interface GoalListProps {
  refreshTrigger: number;
}

export default function GoalList({ refreshTrigger }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on mount OR when refreshTrigger changes
  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  const fetchGoals = async () => {
    try {
      const data = await getMyGoals();
      setGoals(data);
    } catch (err) {
      console.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 FUNCTION 1: Handle Completion
  const handleComplete = async (id: number) => {
    // 1. Confirm intention
    if (!window.confirm("Are you sure you completed this goal? Great job! 🎉")) return;

    try {
      // 2. Call API
      await completeGoal(id);
      
      // 3. Auto-Fetch (Update UI instantly)
      fetchGoals(); 
    } catch (err) {
      alert("Failed to update goal status.");
    }
  };

  // 🔴 FUNCTION 2: Handle Archiving
  const handleArchive = async (id: number) => {
    // 1. Confirm intention
    if (!window.confirm("Are you sure you want to archive this goal?")) return;

    try {
      // 2. Call API
      await deactivateGoal(id);
      
      // 3. Auto-Fetch (Update UI instantly)
      fetchGoals();
    } catch (err) {
      alert("Failed to archive goal.");
    }
  };

  if (loading) return <p className="text-gray-500">Loading goals...</p>;

  if (goals.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
        <p className="text-gray-500 text-lg font-medium">You haven't created any goals yet.</p>
        <p className="text-gray-400 text-sm mt-1">Use the form on the left to start your journey! 🚀</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {goals.map((goal) => (
        <div 
          key={goal.id} 
          className={`p-4 border rounded shadow-sm flex flex-col gap-2 transition hover:shadow-md ${
            goal.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 
            goal.status === 'ARCHIVED' ? 'bg-gray-100 border-gray-200' : 'bg-white'
          }`}
        >
          {/* Goal Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-gray-800">{goal.category}</span>
              
              {/* Status Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                goal.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                goal.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                'bg-gray-200 text-gray-600'
              }`}>
                {goal.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{goal.difficulty}</span> • {goal.dailyMinimumEffort} min/day
            </p>
            <p className="text-xs text-gray-400">
              {goal.startDate} → {goal.endDate}
            </p>
          </div>

          {/* ⚡️ INTERACTIVE BUTTONS 
              Only show these if the goal is ACTIVE.
              Once completed/archived, these buttons disappear automatically.
          */}
          {goal.status === 'ACTIVE' && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
              <button 
                onClick={() => handleComplete(goal.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 rounded transition shadow-sm"
              >
                Complete
              </button>
              <button 
                onClick={() => handleArchive(goal.id)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold py-1.5 rounded transition shadow-sm"
              >
                Archive
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}