import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Timer,
  Trophy,
  Target,
  ChevronDown,
} from "lucide-react";

const StreakCalendar = ({
  activityMap: globalActivityMap = {},
  currentStreak: globalStreak = 0,
  longestStreak: globalLongest = 0,
  goals = [],
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContext, setSelectedContext] = useState("Global");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // --- DATA SWITCHING LOGIC ---
  const {
    map: activeMap,
    current,
    max,
  } = useMemo(() => {
    if (selectedContext === "Global") {
      return {
        map: globalActivityMap || {},
        current: globalStreak || 0,
        max: globalLongest || 0,
      };
    }

    const goal = goals.find((g) => g.id.toString() === selectedContext);
    if (!goal || !goal.history) return { map: {}, current: 0, max: 0 };

    let maxS = 0,
      currS = 0,
      tempS = 0;
    const dates = Object.keys(goal.history).sort();
    const today = new Date().toISOString().split("T")[0];
    let prevDate = null;

    dates.forEach((d) => {
      if (goal.history[d] >= goal.dailyTarget) {
        if (prevDate) {
          const diff = Math.ceil(
            Math.abs(new Date(d) - prevDate) / (1000 * 60 * 60 * 24)
          );
          if (diff === 1) tempS++;
          else tempS = 1;
        } else tempS = 1;
        if (tempS > maxS) maxS = tempS;
        prevDate = new Date(d);
      }
    });

    if (goal.history[today] >= goal.dailyTarget) currS = tempS;

    return { map: goal.history, current: currS, max: maxS };
  }, [selectedContext, globalActivityMap, globalStreak, globalLongest, goals]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- ICON RENDERER ---
  const renderDayIcon = (dateStr) => {
    if (selectedContext === "Global") {
      const type = activeMap[dateStr];
      if (!type) return null;
      if (type === "contest")
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            <Trophy size={12} className="text-purple-400" />
          </div>
        );
      if (type === "milestone")
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <Target size={12} className="text-emerald-400" />
          </div>
        );
      return (
        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.4)]">
          <Flame
            size={14}
            className="text-orange-500"
            fill="currentColor"
            fillOpacity={0.6}
          />
        </div>
      );
    } else {
      // GOAL MODE
      const count = activeMap[dateStr] || 0;
      const goal = goals.find((g) => g.id.toString() === selectedContext);
      const target = goal?.dailyTarget || 1;

      if (count === 0) return null;

      // Green for Hit Target, Yellow/Gray for Miss
      if (count >= target) {
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-green-500/30">
            {count}
          </div>
        );
      }
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/50 flex items-center justify-center text-yellow-500 text-xs font-bold">
          {count}
        </div>
      );
    }
  };

  return (
    <div
      className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0B1121]/80 flex flex-col h-full relative"
      onClick={() => setIsDropdownOpen(false)}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div
            className="relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <button className="flex items-center gap-2 text-lg font-bold text-white hover:text-blue-400 transition">
              {selectedContext === "Global"
                ? "Global Activity"
                : goals
                    .find((g) => g.id.toString() === selectedContext)
                    ?.text.slice(0, 15) + "..."}
              <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#111827] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={() => setSelectedContext("Global")}
                  className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-blue-600 hover:text-white transition border-b border-gray-700"
                >
                  Global Activity
                </button>
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedContext(g.id.toString())}
                    className="w-full text-left px-4 py-3 text-xs text-gray-300 hover:bg-blue-600 hover:text-white transition truncate"
                  >
                    {g.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
              Current
            </p>
            <p className="text-lg font-bold text-white flex items-center justify-end gap-1">
              {current} <Flame size={12} className="text-orange-500" />
            </p>
          </div>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
              Longest
            </p>
            <p className="text-lg font-bold text-white">{max}</p>
          </div>
        </div>
      </div>

      {/* MONTH NAV */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-lg">📅</span> {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 text-center mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <span
            key={d}
            className="text-[10px] font-bold text-gray-500 uppercase"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 place-items-center gap-y-1">
        {(() => {
          const days = [];
          for (let i = 0; i < firstDay; i++)
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(d).padStart(2, "0")}`;
            const icon = renderDayIcon(dateStr);
            days.push(
              <div key={d} className="flex items-center justify-center w-8 h-8">
                {icon || (
                  <div className="w-8 h-8 rounded-full bg-gray-800/30 flex items-center justify-center text-gray-600 text-xs font-medium border border-white/5 hover:border-white/20 transition cursor-default">
                    {d}
                  </div>
                )}
              </div>
            );
          }
          return days;
        })()}
      </div>
    </div>
  );
};

export default StreakCalendar;
