import React, { useEffect, useState } from "react";
import { getUserSubmissions, processProblemTags } from "../services/cfService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { Loader2, Trophy, Target, Activity } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
const PIE_COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6B7280"];

const StatsView = ({ handle }) => {
  const [tagsData, setTagsData] = useState([]);
  const [verdictData, setVerdictData] = useState([]);
  const [ratingData, setRatingData] = useState([]); // NEW: Rating Distribution
  const [loading, setLoading] = useState(true);
  const [totalSolved, setTotalSolved] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!handle) return;
      setLoading(true);
      const submissions = await getUserSubmissions(handle);

      const { topTags, verdictData } = processProblemTags(submissions);

      // --- PROCESS RATING DISTRIBUTION (New Logic) ---
      const ratingCounts = {};
      let ratingSum = 0;
      let ratingCount = 0;
      const uniqueSolved = new Set();

      submissions.forEach((sub) => {
        if (sub.verdict === "OK" && sub.problem.rating) {
          const key = `${sub.problem.contestId}${sub.problem.index}`;
          if (!uniqueSolved.has(key)) {
            uniqueSolved.add(key);

            // Bucket ratings (e.g., 800, 900... 3500)
            const r = sub.problem.rating;
            ratingCounts[r] = (ratingCounts[r] || 0) + 1;

            ratingSum += r;
            ratingCount++;
          }
        }
      });

      // Convert to Array and Sort by Rating
      const distData = Object.entries(ratingCounts)
        .map(([rating, count]) => ({ rating: parseInt(rating), count }))
        .sort((a, b) => a.rating - b.rating);

      setTagsData(topTags);
      setVerdictData(verdictData);
      setRatingData(distData);
      setTotalSolved(uniqueSolved.size);
      setAverageRating(
        ratingCount > 0 ? Math.round(ratingSum / ratingCount) : 0
      );
      setLoading(false);
    };
    fetchData();
  }, [handle]);

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Analyzing performance...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ROW 1: KPI + Verdicts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/20 to-transparent flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={80} />
          </div>
          <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              Total Solved
            </div>
            <div className="text-6xl font-mono font-bold text-white mb-4">
              {totalSolved}
            </div>

            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              Average Difficulty
            </div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {averageRating}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
              AC: {verdictData.find((v) => v.name === "Accepted")?.value || 0}
            </span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">
              WA: {verdictData.find((v) => v.name === "Wrong Ans")?.value || 0}
            </span>
          </div>
        </div>

        {/* Verdict Donut Chart (Improved) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Activity size={18} className="text-purple-400" /> Submission
              Outcomes
            </h3>
            <p className="text-gray-400 text-xs mb-6">
              Breakdown of all your submission verdicts, including errors and
              successful attempts.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {verdictData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <div>
                    <div className="text-white font-bold">{entry.value}</div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      {entry.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-48 w-48 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={verdictData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {verdictData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-gray-500">VERDICTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: RATING DISTRIBUTION (NEW) */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target size={18} className="text-emerald-400" /> Rating
              Distribution
            </h3>
            <p className="text-gray-400 text-xs">
              Problems solved by difficulty rating.
            </p>
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ratingData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                vertical={false}
              />
              <XAxis
                dataKey="rating"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F3F4F6",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 3: TOPICS & RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Topic Strength</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={tagsData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    color: "#F3F4F6",
                  }}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tagsData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 text-center">
            Skill Balance
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={tagsData.slice(0, 6)}
              >
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    color: "#F3F4F6",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
