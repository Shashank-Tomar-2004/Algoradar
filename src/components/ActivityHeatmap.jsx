import React, { useMemo } from 'react';
import { Tooltip } from 'react-tooltip';

const ActivityHeatmap = ({ submissions }) => {
  // 1. Process data
  const activityMap = useMemo(() => {
    const map = {};
    if (!submissions) return map;
    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });
    return map;
  }, [submissions]);

  // 2. Generate Calendar Data
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const weeksData = [];
    const monthLabels = [];
    
    // Start 52 weeks ago, aligned to Sunday
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    // Adjust to previous Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentMonth = -1;

    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + (w * 7) + d);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // Check for month change (using the 1st week of the month)
        if (d === 0) {
            const m = dayDate.getMonth();
            if (m !== currentMonth) {
                monthLabels.push({ name: dayDate.toLocaleString('default', { month: 'short' }), index: w });
                currentMonth = m;
            }
        }
        week.push(dateStr);
      }
      weeksData.push(week);
    }
    return { weeks: weeksData, months: monthLabels };
  }, []);

  const getColor = (count) => {
    if (!count) return 'bg-[#161b22]';
    if (count <= 2) return 'bg-[#0e4429]';
    if (count <= 5) return 'bg-[#006d32]';
    if (count <= 10) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl w-full overflow-hidden">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#39d353]"></span>
        Submission Activity
      </h2>
      
      <div className="overflow-x-auto">
         <div className="flex flex-col min-w-max">
            
            {/* Month Labels */}
            <div className="flex mb-2 text-[10px] text-gray-400 ml-8 relative h-4">
                {months.map((m, i) => (
                    <span key={i} style={{ position: 'absolute', left: `${m.index * 14}px` }}>{m.name}</span>
                ))}
            </div>

            <div className="flex gap-2">
                {/* Day Labels (Mon, Wed, Fri) */}
                <div className="flex flex-col justify-between text-[9px] text-gray-500 h-[98px] py-1">
                    <span></span>
                    <span>Mon</span>
                    <span></span>
                    <span>Wed</span>
                    <span></span>
                    <span>Fri</span>
                    <span></span>
                </div>

                {/* The Grid */}
                <div className="flex gap-[3px]">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((date, dIndex) => {
                                const count = activityMap[date] || 0;
                                return (
                                    <div
                                        key={date}
                                        data-tooltip-id="heatmap-tooltip"
                                        data-tooltip-content={`${date}: ${count} submissions`}
                                        className={`w-[11px] h-[11px] rounded-[2px] ${getColor(count)} border border-black/10`}
                                    ></div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
      <Tooltip id="heatmap-tooltip" style={{ backgroundColor: "#1f2937", color: "#fff" }} />
    </div>
  );
};

export default ActivityHeatmap;
