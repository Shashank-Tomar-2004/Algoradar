import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ContestCalendar = ({ contests = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!contests) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const eventsMap = {};
  contests.forEach((c) => {
    if (!c.startTimeSeconds) return;
    const date = new Date(c.startTimeSeconds * 1000);
    if (date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate();
      if (!eventsMap[day]) eventsMap[day] = [];
      eventsMap[day].push(c);
    }
  });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const getDotColor = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes("codeforces")) return "bg-blue-500";
    if (p.includes("leetcode")) return "bg-yellow-400";
    if (p.includes("atcoder")) return "bg-white";
    if (p.includes("codechef")) return "bg-[#8D6E63]";
    return "bg-gray-500";
  };

  const renderDays = () => {
    const slots = [];
    for (let i = 0; i < firstDay; i++)
      slots.push(<div key={`empty-${i}`} className="aspect-square"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const events = eventsMap[d] || [];
      const hasEvents = events.length > 0;

      slots.push(
        <div
          key={d}
          className={`aspect-square border border-white/5 relative flex flex-col items-center justify-start pt-2 group ${
            hasEvents ? "bg-white/5 hover:bg-white/10 cursor-pointer" : ""
          }`}
        >
          <span
            className={`text-xs ${
              hasEvents ? "text-white font-bold" : "text-gray-600"
            }`}
          >
            {d}
          </span>
          <div className="flex gap-1 mt-1.5 flex-wrap justify-center px-1">
            {events.slice(0, 4).map((e, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${getDotColor(
                  e.platform
                )}`}
              ></div>
            ))}
          </div>
          {hasEvents && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0f172a] border border-gray-700 p-3 rounded-xl shadow-2xl z-50 hidden group-hover:block text-left">
              <div className="text-[10px] font-bold text-gray-400 mb-2 border-b border-gray-800 pb-1">
                {d} {monthName}
              </div>
              {events.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 mb-1.5 last:mb-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${getDotColor(
                      e.platform
                    )}`}
                  ></div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-white truncate max-w-[140px]">
                      {e.name}
                    </div>
                    <div className="text-[9px] text-gray-500">
                      {new Date(e.startTimeSeconds * 1000).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-[#0B1121]/80 h-fit shadow-2xl">
      <div className="p-4 flex justify-between items-center border-b border-white/5 bg-black/20">
        <span className="font-bold text-white text-sm tracking-wider">
          {monthName} {year}
        </span>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center py-2 bg-black/20 border-b border-white/5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
          <span key={d} className="text-[10px] text-gray-500 font-bold">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 p-2 gap-1">{renderDays()}</div>
    </div>
  );
};

export default ContestCalendar;
