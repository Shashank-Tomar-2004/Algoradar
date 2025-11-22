import React, { useEffect, useState } from 'react';
import { getRecommendations, COMMON_TAGS } from '../services/cfService';
import { ExternalLink, Zap, Code, Filter, RefreshCw } from 'lucide-react';

const RecommendationView = ({ handle }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    tag: 'all'
  });

  const fetchRecs = async () => {
    setLoading(true);
    const recs = await getRecommendations(handle, filters);
    setProblems(recs);
    setLoading(false);
  };

  // Initial load
  useEffect(() => { if (handle) fetchRecs(); }, [handle]);

  return (
    <div className="glass-panel p-6 rounded-2xl border-blue-500/20">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
             <Zap className="text-purple-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Recommended Targets</h2>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 px-2 border-r border-white/10">
               <Filter size={14} className="text-gray-400" />
               <span className="text-xs font-bold text-gray-400 uppercase">Filters</span>
            </div>
            
            <input 
               placeholder="Min Rating" 
               className="w-20 bg-transparent text-xs text-white placeholder-gray-600 outline-none border-r border-white/10 px-2"
               value={filters.minRating}
               onChange={(e) => setFilters({...filters, minRating: e.target.value})}
            />
            <input 
               placeholder="Max Rating" 
               className="w-20 bg-transparent text-xs text-white placeholder-gray-600 outline-none border-r border-white/10 px-2"
               value={filters.maxRating}
               onChange={(e) => setFilters({...filters, maxRating: e.target.value})}
            />
            
            <select 
               className="bg-transparent text-xs text-gray-300 outline-none border-r border-white/10 px-2 w-24"
               value={filters.tag}
               onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
               <option value="all">All Tags</option>
               {COMMON_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button 
              onClick={fetchRecs}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
              title="Apply Filters"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
           // Skeleton Loading
           [...Array(5)].map((_, i) => (
             <div key={i} className="h-40 bg-gray-800/50 rounded-xl animate-pulse"></div>
           ))
        ) : problems.length > 0 ? (
           problems.map((p) => (
            <div key={`${p.contestId}${p.index}`} className="group relative bg-gray-900/50 border border-white/5 hover:border-blue-500/50 p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(59,130,246,0.3)] flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20">{p.contestId}{p.index}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${p.rating >= 1600 ? 'text-red-400 bg-red-900/20' : 'text-green-400 bg-green-900/20'}`}>{p.rating}</span>
                </div>
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-4 group-hover:text-blue-300 transition">{p.name}</h3>
              </div>
              <div className="mt-auto">
                 <a href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/5 hover:bg-blue-600 text-xs font-bold text-gray-300 hover:text-white transition border border-white/5 hover:border-transparent"><Code size={12} /> Solve</a>
              </div>
            </div>
           ))
        ) : (
          <div className="col-span-5 text-center py-10 text-gray-500">
            No problems found with these filters. Try adjusting the range.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationView;
