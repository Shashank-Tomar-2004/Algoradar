import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Target,
  Trophy,
  PenTool,
  Minus,
  Calendar,
} from "lucide-react";

const GoalsWidget = ({ goals, setGoals }) => {
  const [mode, setMode] = useState("problems");
  const [targetCount, setTargetCount] = useState(3);

  // NEW: Duration State
  const [durationVal, setDurationVal] = useState(1);
  const [durationUnit, setDurationUnit] = useState("Weeks"); // Days, Weeks, Months

  const [customText, setCustomText] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // Load/Save logic (same as before)
  useEffect(() => {
    const saved = localStorage.getItem("algoradar_goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("algoradar_goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    let text = "";
    let type = "custom";
    let dailyTarget = 0;

    if (mode === "custom") {
      if (!customText.trim()) return;
      text = customText;
    } else if (mode === "problems") {
      // "Solve 3 problems daily for 2 Weeks"
      text = `Solve ${targetCount} problems daily for ${durationVal} ${durationUnit}`;
      type = "problem";
      dailyTarget = targetCount;
    } else if (mode === "contests") {
      // "Participate in 1 contest per week for 1 Month"
      // Simplified for the tracker: dailyTarget implies 'frequency'
      text = `Participate in ${targetCount} contests for ${durationVal} ${durationUnit}`;
      type = "contest";
      dailyTarget = targetCount;
    }

    const newGoal = {
      id: Date.now(),
      text,
      type,
      dailyTarget,
      startDate: today,
      history: {},
    };
    setGoals([...goals, newGoal]);
    setCustomText("");
  };

  const deleteGoal = (id) => setGoals(goals.filter((g) => g.id !== id));
  const toggleGoal = (id) =>
    setGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  const updateProgress = (id, delta) => {
    setGoals(
      goals.map((g) =>
        g.id === id
          ? {
              ...g,
              history: {
                ...g.history,
                [today]: Math.max(0, (g.history[today] || 0) + delta),
              },
            }
          : g
      )
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0B1121]/60 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 text-white font-bold">
        <CheckSquare className="text-emerald-400" size={20} />
        <h3>Target Tracker</h3>
      </div>

      <div className="flex-1 space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
        {goals.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-xs italic border border-dashed border-white/10 rounded-xl">
            No active targets.
          </div>
        )}
        {goals.map((g) => (
          <div
            key={g.id}
            className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {g.type === "problem" ? (
                  <Target size={14} className="text-blue-400" />
                ) : g.type === "contest" ? (
                  <Trophy size={14} className="text-yellow-400" />
                ) : (
                  <PenTool size={14} className="text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-200">
                  {g.text}
                </span>
              </div>
              <button
                onClick={() => deleteGoal(g.id)}
                className="text-gray-600 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {g.dailyTarget > 0 && (
              <div className="flex items-center justify-between bg-black/20 rounded-lg p-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateProgress(g.id, -1)}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-mono w-12 text-center text-white">
                    {g.history[today] || 0} / {g.dailyTarget}
                  </span>
                  <button
                    onClick={() => updateProgress(g.id, 1)}
                    className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-black/20 p-3 rounded-xl border border-white/5">
        <div className="flex gap-2 mb-3">
          {["problems", "contests", "custom"].map((t) => (
            <button
              key={t}
              onClick={() => setMode(t)}
              className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition ${
                mode === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {mode === "custom" ? (
          <div className="flex gap-2">
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type goal..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
            />
            <button
              onClick={addGoal}
              className="h-9 w-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center"
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Row 1: Target Count */}
            <div className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
              <span className="text-[10px] text-gray-400 uppercase font-bold">
                Target
              </span>
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-12 bg-transparent text-right text-white text-xs font-bold outline-none"
              />
            </div>

            {/* Row 2: Duration */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                <Calendar size={12} className="text-gray-500 mr-2" />
                <input
                  type="number"
                  min="1"
                  value={durationVal}
                  onChange={(e) => setDurationVal(e.target.value)}
                  className="w-8 bg-transparent text-white text-xs font-bold outline-none"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className="bg-transparent text-[10px] text-blue-400 font-bold outline-none uppercase cursor-pointer ml-auto"
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
              </div>
              <button
                onClick={addGoal}
                className="h-full w-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsWidget;
