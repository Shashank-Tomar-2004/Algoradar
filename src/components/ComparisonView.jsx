import React, { useState } from "react";
import {
  getUserSubmissions,
  processProblemTags,
  verifyUserHandle,
  calculateUserStats,
} from "../services/cfService";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Search, Swords, AlertCircle } from "lucide-react";

const ComparisonView = ({ myHandle }) => {
  const [opponentHandle, setOpponentHandle] = useState("");
  const [opponentData, setOpponentData] = useState(null);
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!opponentHandle) return;
    setLoading(true);
    setError("");

    const [mySubs, oppSubs, myProfile, oppProfile] = await Promise.all([
      getUserSubmissions(myHandle),
      getUserSubmissions(opponentHandle),
      verifyUserHandle(myHandle),
      verifyUserHandle(opponentHandle),
    ]);

    if (!oppProfile) {
      setError("User not found");
      setLoading(false);
      return;
    }

    // Process Data
    const processStats = (subs, profile) => {
      const { topTags } = processProblemTags(subs);
      const { xp } = calculateUserStats(subs);
      return {
        tags: topTags,
        xp,
        rating: profile.rating || 0,
        count: subs.filter((s) => s.verdict === "OK").length,
      };
    };

    const myStats = processStats(mySubs, myProfile);
    const oppStats = processStats(oppSubs, oppProfile);

    // Merge Radar Data (Normalize values for better overlap comparison)
    // We take the UNION of top tags from both users
    const allTags = new Set([
      ...myStats.tags.map((t) => t.name),
      ...oppStats.tags.map((t) => t.name),
    ]);
    const radarData = Array.from(allTags)
      .slice(0, 6)
      .map((tag) => {
        const myVal = myStats.tags.find((t) => t.name === tag)?.value || 0;
        const oppVal = oppStats.tags.find((t) => t.name === tag)?.value || 0;
        // Normalize to 100 max for visual comparison
        const maxVal = Math.max(myVal, oppVal, 1);
        return {
          subject: tag,
          A: myVal,
          B: oppVal,
          fullMark: maxVal,
        };
      });

    setMyData(myStats);
    setOpponentData({ ...oppStats, handle: opponentHandle });
    setMyData({ ...myStats, radar: radarData }); // Store merged radar data
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* SEARCH CARD */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Swords className="text-red-500" /> Rivalry Mode
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              value={opponentHandle}
              onChange={(e) => setOpponentHandle(e.target.value)}
              placeholder="Enter opponent handle..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleCompare}
              disabled={loading}
              className="p-3 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-500 transition"
            >
              <Search size={20} />
            </button>
          </div>
          {error && (
            <div className="text-red-400 text-xs flex items-center gap-1 mb-2">
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Compare ratings, problem counts, and topic strengths side-by-side.
          </p>
        </div>

        {opponentData && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-red-900/10 to-transparent">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Head to Head
            </h3>

            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-bold">{myHandle}</span>
              <span className="text-xs text-gray-500">VS</span>
              <span className="text-red-400 font-bold">
                {opponentData.handle}
              </span>
            </div>

            {/* Simple Bar Comparison */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Rating</span>
                </div>
                <div className="flex h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        (myData.rating /
                          (myData.rating + opponentData.rating)) *
                        100
                      }%`,
                    }}
                    className="bg-blue-500"
                  ></div>
                  <div
                    style={{
                      width: `${
                        (opponentData.rating /
                          (myData.rating + opponentData.rating)) *
                        100
                      }%`,
                    }}
                    className="bg-red-500"
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>{myData.rating}</span>
                  <span>{opponentData.rating}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Solved</span>
                </div>
                <div className="flex h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        (myData.count / (myData.count + opponentData.count)) *
                        100
                      }%`,
                    }}
                    className="bg-blue-500"
                  ></div>
                  <div
                    style={{
                      width: `${
                        (opponentData.count /
                          (myData.count + opponentData.count)) *
                        100
                      }%`,
                    }}
                    className="bg-red-500"
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>{myData.count}</span>
                  <span>{opponentData.count}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RADAR CHART RESULT */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
        {!myData ? (
          <div className="text-center text-gray-500">
            <Swords size={64} className="mx-auto mb-4 opacity-20" />
            <p>Enter a handle to start comparison</p>
          </div>
        ) : (
          <div className="w-full h-[400px]">
            <h3 className="text-center font-bold text-white mb-4">
              Skill Overlap
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={myData.radar}
              >
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={false}
                  axisLine={false}
                />

                <Radar
                  name={myHandle}
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Radar
                  name={opponentData.handle}
                  dataKey="B"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.4}
                />

                <Legend />
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
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
