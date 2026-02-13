import { useState } from "react";
import { createGoal } from "./goalService";
import { GoalCategory, GoalDifficulty, GoalVisibility } from "./types";

// ✅ EXACT BACKEND MATCH — DO NOT CHANGE
const categories: GoalCategory[] = [
  "CODING",
  "HEALTH",
  "FITNESS",
  "READING",
  "ACADEMICS",
  "CAREER",
  "PERSONAL_GROWTH",
];

const difficulties: GoalDifficulty[] = ["EASY", "MEDIUM", "HARD"];

interface Props {
  onSuccess?: () => void;
}

export default function CreateGoalForm({ onSuccess }: Props) {
  const [category, setCategory] = useState<GoalCategory>("CODING");
  const [difficulty, setDifficulty] = useState<GoalDifficulty>("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyMinimumEffort, setDailyMinimumEffort] = useState(30);
  const [visibility, setVisibility] = useState<GoalVisibility>("PRIVATE");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createGoal({
        category,
        difficulty,
        startDate,
        endDate,
        dailyMinimumEffort,
        visibility,
      });

      alert("Goal created successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create goal");
    }
  };

  return (
    <form className="space-y-5 bg-white p-6 rounded shadow border" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">Create New Goal</h2>
      <p className="text-sm text-gray-500">Define what you want to achieve.</p>

      <div>
        <label className="font-semibold">Category</label>
        <select className="w-full border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value as GoalCategory)}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <p className="text-xs text-gray-500">Goals are grouped by category for analytics.</p>
      </div>

      <div>
        <label className="font-semibold">Difficulty</label>
        <select className="w-full border p-2 rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as GoalDifficulty)}
        >
          {difficulties.map(d => <option key={d}>{d}</option>)}
        </select>
        <p className="text-xs text-gray-500">Difficulty affects scoring later.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Start Date</label>
          <input type="date" className="w-full border p-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-semibold">End Date</label>
          <input type="date" className="w-full border p-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="font-semibold">Daily Minimum Effort (minutes)</label>
        <input type="number" min={1} className="w-full border p-2 rounded"
          value={dailyMinimumEffort}
          onChange={(e) => setDailyMinimumEffort(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="font-semibold">Visibility</label>
        <select className="w-full border p-2 rounded"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as GoalVisibility)}
        >
          <option value="PRIVATE">PRIVATE (Only you)</option>
          <option value="PUBLIC">PUBLIC (Leaderboards later)</option>
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Create Goal
      </button>
    </form>
  );
}
