import React, { useEffect, useState } from "react";
import { getUpcomingContests } from "../services/cfService";
import {
  Calendar,
  ExternalLink,
  Timer,
  ArrowRight,
  Filter,
  List,
} from "lucide-react";
import ContestCalendar from "./ContestCalendar";

const PLATFORM_LOGOS = {
  codeforces: "https://cdn.simpleicons.org/codeforces/1f8acb",
  leetcode: "https://cdn.simpleicons.org/leetcode/ffa116",
  codechef: "https://cdn.simpleicons.org/codechef/5b4638",
  atcoder: "https://img.atcoder.jp/assets/atcoder.png",
  hackerrank: "https://cdn.simpleicons.org/hackerrank/2ec866",
};

const getPlatformKey = (p) => {
  const lower = p.toLowerCase();
  if (lower.includes("codeforces")) return "codeforces";
  if (lower.includes("leetcode")) return "leetcode";
  if (lower.includes("atcoder")) return "atcoder";
  if (lower.includes("codechef")) return "codechef";
  return "hackerrank";
};

// Updated Signature: accepts 'widget' boolean
const ContestView = ({ limit, widget, onViewMore }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("All");

  useEffect(() => {
    getUpcomingContests().then((data) => {
      setContests(data || []);
      setLoading(false);
    });
  }, []);

  const filteredContests = contests.filter(
    (c) =>
      platformFilter === "All" ||
      getPlatformKey(c.platform) === getPlatformKey(platformFilter)
  );

  const formatTimeIST = (seconds) =>
    new Date(seconds * 1000).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const formatDuration = (seconds) =>
    `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  const platforms = ["All", "Codeforces", "LeetCode", "AtCoder", "CodeChef"];

  if (loading)
    return (
      <div className="h-full min-h-[200px] glass-panel animate-pulse rounded-xl border border-white/5"></div>
    );

  // --- WIDGET MODE (Sidebar Style) ---
  if (widget || limit) {
    const displayContests = limit ? contests.slice(0, limit) : contests; // If widget=true and limit=null, show ALL

    return (
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden h-full flex flex-col bg-[#0B1121]/60">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-400" size={18} />
            <h2 className="text-sm font-bold text-white">Upcoming Events</h2>
          </div>
          <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {contests.length} Active
          </span>
        </div>

        {/* FLEX-1 ensures it fills the space */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ContestList
            contests={displayContests}
            formatTime={formatTimeIST}
            duration={formatDuration}
          />
        </div>

        {onViewMore && (
          <button
            onClick={onViewMore}
            className="w-full p-3 bg-white/5 hover:bg-blue-600/20 text-xs text-blue-400 font-bold transition border-t border-white/5 flex items-center justify-center gap-2"
          >
            View All <ArrowRight size={12} />
          </button>
        )}
      </div>
    );
  }

  // --- FULL PAGE MODE (Split Layout) ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col bg-[#0B1121]/80 h-full">
        <div className="p-5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Filter className="text-blue-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Contest Schedule</h2>
          </div>
          <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full custom-scrollbar">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition whitespace-nowrap ${
                  platformFilter === p
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <ContestList
            contests={filteredContests}
            formatTime={formatTimeIST}
            duration={formatDuration}
          />
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6 h-full">
        <ContestCalendar contests={filteredContests} />
        {filteredContests.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/20 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="text-purple-400" size={20} />
              <span className="text-sm font-bold text-white">Up Next</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mb-2">
              {filteredContests[0].name}
            </h3>
            <p className="text-xs text-gray-400 bg-black/30 p-2 rounded border border-white/5 mb-4">
              {formatTimeIST(filteredContests[0].startTimeSeconds)}
            </p>
            <a
              href={filteredContests[0].url}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-center font-bold rounded-xl transition shadow-lg shadow-purple-900/20"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const ContestList = ({ contests, formatTime, duration }) => (
  <div className="space-y-2">
    {contests.map((contest) => {
      const key = getPlatformKey(contest.platform);
      return (
        <div
          key={contest.id}
          className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center p-1.5 border border-white/10 shrink-0">
            <img
              src={PLATFORM_LOGOS[key]}
              alt={contest.platform}
              className="w-full h-full object-contain opacity-90"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 text-gray-400 uppercase tracking-wider">
                {contest.platform}
              </span>
              <h3 className="text-white font-bold text-sm truncate">
                {contest.name}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {formatTime(contest.startTimeSeconds)}
              </span>
              <span className="flex items-center gap-1">
                <Timer size={12} /> {duration(contest.durationSeconds)}
              </span>
            </div>
          </div>
          <a
            href={contest.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-lg"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      );
    })}
  </div>
);

export default ContestView;
