import React, { useState } from "react";
import { getAdvancedRecommendations, COMMON_TAGS } from "../services/cfService";
import { Target, Code, Filter, RefreshCw, Database } from "lucide-react";

const TrainingView = ({ handle }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(1200);
  const [selectedTags, setSelectedTags] = useState([]);
  const [problemCount, setProblemCount] = useState(5);

  // --- SMART RANGE LOGIC ---
  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    setMinRating(val);
    // If Min goes above Max, push Max up
    if (val > maxRating) setMaxRating(val);
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    setMaxRating(val);
    // If Max goes below Min, push Min down
    if (val < minRating) setMinRating(val);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const generateSet = async () => {
    setLoading(true);
    const probs = await getAdvancedRecommendations(handle, {
      minRating,
      maxRating,
      tags: selectedTags,
      count: problemCount,
    });
    setProblems(probs);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT: CONFIG GENERATOR (Span 4) */}
      <div className="lg:col-span-4 glass-panel p-0 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-2">
          <Filter className="text-blue-400" size={20} />
          <h2 className="font-bold text-white">Config Generator</h2>
        </div>

        <div className="p-5 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          {/* Rating Range */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Rating Range
              </label>
              <span className="text-xs text-blue-400 font-mono">
                {minRating} - {maxRating}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative w-full">
                <input
                  type="number"
                  step="100"
                  min="800"
                  max="3500"
                  value={minRating}
                  onChange={handleMinChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white text-center focus:border-blue-500 outline-none transition"
                />
                <span className="absolute text-[10px] text-gray-600 bottom-1 left-0 w-full text-center">
                  Min
                </span>
              </div>
              <span className="text-gray-500 font-bold">-</span>
              <div className="relative w-full">
                <input
                  type="number"
                  step="100"
                  min="800"
                  max="3500"
                  value={maxRating}
                  onChange={handleMaxChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white text-center focus:border-blue-500 outline-none transition"
                />
                <span className="absolute text-[10px] text-gray-600 bottom-1 left-0 w-full text-center">
                  Max
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              Ratings are multiples of 100 (800, 900...)
            </p>
          </div>

          {/* Count Slider */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Problem Count
              </label>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">
                {problemCount}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={problemCount}
              onChange={(e) => setProblemCount(e.target.value)}
              className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 transition"
            />
          </div>

          {/* Tags Selection */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">
              Topics{" "}
              {selectedTags.length > 0 && (
                <span className="text-white">({selectedTags.length})</span>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] px-2 py-1.5 rounded border transition ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                      : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button (Fixed at bottom) */}
        <div className="p-5 border-t border-white/5 bg-black/20">
          <button
            onClick={generateSet}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Database size={18} />
            )}
            {loading ? "Generating..." : "Generate Problem Set"}
          </button>
        </div>
      </div>

      {/* RIGHT: RESULTS (Span 8) */}
      <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar">
        {problems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((p, i) => (
              <div
                key={i}
                className="glass-panel p-6 rounded-xl border border-white/5 hover:border-blue-500/40 transition group relative overflow-hidden bg-[#0B1121]/40"
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                {/* Icon Watermark */}
                <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
                  <Code size={64} />
                </div>

                {/* Card Header */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 font-mono">
                    {p.contestId}
                    {p.index}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                      p.rating >= 2000
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : p.rating >= 1600
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-green-500/10 text-green-400 border-green-500/20"
                    }`}
                  >
                    {p.rating}
                  </span>
                </div>

                {/* Title */}
                <h3 className="relative z-10 font-bold text-white text-lg mb-3 truncate pr-8 group-hover:text-blue-300 transition">
                  {p.name}
                </h3>

                {/* Tags */}
                <div className="relative z-10 flex flex-wrap gap-1.5 mb-6 h-12 overflow-hidden content-start">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <a
                  href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 flex items-center justify-center w-full py-2.5 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500/50 rounded-lg text-xs font-bold text-gray-300 hover:text-white transition shadow-lg"
                >
                  Solve Problem
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full min-h-[400px] glass-panel rounded-2xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 bg-[#0B1121]/20">
            <div className="p-6 bg-gray-800/50 rounded-full mb-4 animate-pulse">
              <Target size={48} className="opacity-50" />
            </div>
            <p className="text-lg font-medium text-gray-400">
              Training Mode Idle
            </p>
            <p className="text-sm opacity-50 mt-1">
              Configure the parameters to generate a session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingView;
