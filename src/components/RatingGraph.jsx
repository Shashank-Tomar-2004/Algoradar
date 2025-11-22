import React, { useEffect, useState } from "react";
import { getRatingHistory } from "../services/cfService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

const RatingGraph = ({ handle }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (handle) {
      getRatingHistory(handle).then(setData);
    }
  }, [handle]);

  if (data.length === 0) return null;

  const currentRating = data[data.length - 1].newRating;
  const maxRating = Math.max(...data.map((d) => d.newRating));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0B1121]/40">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={20} /> Rating History
          </h3>
          <p className="text-xs text-gray-500">Contest performance over time</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{currentRating}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">
            Peak: <span className="text-yellow-500">{maxRating}</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />
            <XAxis dataKey="date" hide />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#6B7280", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#F3F4F6",
              }}
              itemStyle={{ color: "#60A5FA" }}
              labelStyle={{ display: "none" }}
              formatter={(value) => [`${value}`, "Rating"]}
            />
            <Area
              type="monotone"
              dataKey="newRating"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRating)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingGraph;
