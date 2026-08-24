import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { fetchUsageData, fetchHistoricalStats } from '../services/api';
import { Calendar, Activity, Droplets, AlertCircle } from 'lucide-react';

export default function UsageHistoryView() {
  const [timeframe, setTimeframe] = useState('week'); // 'day', 'week', 'month'
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, historyStats] = await Promise.all([
          fetchUsageData(timeframe),
          fetchHistoricalStats()
        ]);
        setChartData(data);
        setStats(historyStats);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [timeframe]);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel p-4">
        <div>
          <h2 className="text-xl font-bold text-textStrong">Historical Usage Data</h2>
          <p className="text-textMuted text-sm">Data retrieved from MongoDB</p>
        </div>
        
        {/* Timeframe Toggles */}
        <div className="flex p-1 bg-background/50 rounded-xl border border-cardBorder">
          {['day', 'week', 'month'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                timeframe === tf 
                  ? 'bg-primary text-textStrong shadow-lg' 
                  : 'text-textMuted hover:text-textStrong hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-textStrong">
            {timeframe === 'day' ? 'Hourly Usage (Last 24h)' : timeframe === 'week' ? 'Daily Usage (This Week)' : 'Weekly Usage (This Month)'}
          </h3>
          {isLoading && (
             <div className="text-primary text-sm font-medium animate-pulse">Loading data...</div>
          )}
        </div>
        
        <div className="h-[400px] w-full">
          {!isLoading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 27, 51, 0.9)', 
                    borderColor: 'rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Bar dataKey="usage" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-textMuted">
                {isLoading ? 'Fetching from database...' : 'No data available'}
             </div>
          )}
        </div>
      </div>

      {/* Historical Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up [animation-delay:200ms]">
          <div className="glass-panel p-5 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-textMuted">
                <Activity size={18} />
                <span className="text-sm font-medium">Avg Daily Usage</span>
             </div>
             <div className="text-3xl font-bold text-textStrong">{stats.averageDaily} <span className="text-base text-textMuted font-normal">L</span></div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-textMuted">
                <Calendar size={18} />
                <span className="text-sm font-medium">Highest Usage Day</span>
             </div>
             <div className="text-2xl font-bold text-primary">{stats.highestUsageDay}</div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-textMuted">
                <Droplets size={18} />
                <span className="text-sm font-medium">Total This Month</span>
             </div>
             <div className="text-3xl font-bold text-white">{stats.totalMonthly} <span className="text-base text-textMuted font-normal">L</span></div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 text-textMuted">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">Leakage Events</span>
             </div>
             <div className="text-3xl font-bold text-danger">{stats.leakageEvents} <span className="text-base text-textMuted font-normal">detected</span></div>
          </div>
        </div>
      )}

    </div>
  );
}
