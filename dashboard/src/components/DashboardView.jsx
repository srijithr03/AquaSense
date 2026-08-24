import React, { useState, useEffect } from 'react';
import { 
  Activity, Droplet, BarChart2, Target, CloudRain, Calendar, Bell, 
  Sparkles, Leaf, ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { io } from 'socket.io-client';
import { fetchDashboardStats, fetchUsageData } from '../services/api';

const weeklyData = [
  { day: 'Mon', usage: 120 },
  { day: 'Tue', usage: 145 },
  { day: 'Wed', usage: 80 },
  { day: 'Thu', usage: 157 },
  { day: 'Fri', usage: 130 },
  { day: 'Sat', usage: 190 },
  { day: 'Sun', usage: 170 },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DashboardView({ setActiveTab }) {
  const [liveData, setLiveData] = useState({
    flowRate: 0.0,
    status: 'IDLE',
    lastUpdated: '-'
  });
  const [stats, setStats] = useState({
    todayWater: 0,
    monthlyWater: 0,
    goalPercentage: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Initial fetch
    const loadData = async () => {
      const dbStats = await fetchDashboardStats();
      if (dbStats && dbStats.latest) {
        setLiveData({
          flowRate: dbStats.latest.flowRate || 0,
          status: dbStats.latest.status || 'IDLE',
          lastUpdated: dbStats.latest.time || '-'
        });
        setStats({
          todayWater: dbStats.stats.todayWater || 0,
          monthlyWater: dbStats.stats.monthlyWater || 0,
          goalPercentage: Math.min(100, Math.round(((dbStats.stats.todayWater || 0) / 200) * 100))
        });
      }
      
      const cData = await fetchUsageData('day');
      setChartData(cData);
    };
    loadData();

    // Socket.io connection
    const socket = io(API_URL);
    socket.on('newReading', (reading) => {
      setLiveData({
        flowRate: reading.flowRate,
        status: reading.status,
        lastUpdated: reading.time
      });
      // Optionally re-fetch stats or increment them
      // Simple way: re-fetch stats every few readings or just rely on the new reading's totals
      setStats(prev => ({
        ...prev,
        todayWater: reading.totalWater, // Using totalWater for today as an approximation based on ESP32 logic
        goalPercentage: Math.min(100, Math.round((reading.totalWater / 200) * 100))
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Wave SVG Component
  const WaveGraphic = ({ color }) => (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden opacity-50 translate-y-2">
      <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-10 w-full">
        <path d="M0,50 C150,150 350,0 500,50 L500,150 L0,150 Z" stroke="none" fill={color}></path>
        <path d="M0,50 C150,150 350,0 500,50" stroke={color} strokeWidth="4" fill="none" className="drop-shadow-[0_0_8px_currentColor]"></path>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4 mb-2 animate-fade-up">
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <CloudRain size={28} className="text-textMuted" />
            <div className="flex flex-col">
              <span className="text-textStrong font-bold leading-tight">28°C</span>
              <span className="text-textMuted text-xs">Light Rain</span>
            </div>
          </div>
          
          <div className="w-px h-10 bg-cardBorder"></div>
          
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-textMuted" />
            <div className="flex flex-col">
              <span className="text-textStrong font-bold leading-tight text-sm">06 Aug 2025</span>
              <span className="text-textMuted text-xs">Wed, 10:30 AM</span>
            </div>
          </div>
          
          <div className="w-px h-10 bg-cardBorder hidden sm:block"></div>
          
          <button 
            onClick={() => setActiveTab('Alerts')}
            className="relative p-2.5 rounded-full bg-card border border-cardBorder text-textMuted hover:text-textStrong transition-colors"
          >
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">3</span>
          </button>
        </div>
      </header>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Flow Rate */}
        <div className="bg-card rounded-2xl p-5 border border-cardBorder relative overflow-hidden flex flex-col justify-between h-40 group hover:border-primary/50 transition-colors animate-fade-up">
          <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Activity size={20} />
            </div>
            <span className="text-textStrong font-medium text-sm">Live Flow Rate</span>
          </div>
          <div className="z-10 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-textStrong">{liveData.flowRate.toFixed(2)}</span>
              <span className="text-textMuted text-sm">L/min</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${liveData.status === 'FLOWING' ? 'bg-accent animate-pulse' : 'bg-textMuted'}`}></span>
              <span className={`${liveData.status === 'FLOWING' ? 'text-accent' : 'text-textMuted'} text-sm font-medium`}>{liveData.status}</span>
            </div>
          </div>
          <WaveGraphic color="var(--color-primary)" />
        </div>

        {/* Total Usage */}
        <div className="bg-card rounded-2xl p-5 border border-cardBorder relative overflow-hidden flex flex-col justify-between h-40 group hover:border-accent/50 transition-colors animate-fade-up [animation-delay:100ms]">
          <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-accent/20 rounded-lg text-accent">
              <Droplet size={20} />
            </div>
            <span className="text-textStrong font-medium text-sm">Total Usage (Today)</span>
          </div>
          <div className="z-10 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-textStrong">{stats.todayWater.toFixed(1)}</span>
              <span className="text-textMuted text-sm">Litres</span>
            </div>
            <p className="text-accent text-sm font-medium mt-2">Today's Total</p>
          </div>
          <WaveGraphic color="var(--color-accent)" />
        </div>

        {/* Est Monthly */}
        <div className="bg-card rounded-2xl p-5 border border-cardBorder relative overflow-hidden flex flex-col justify-between h-40 group hover:border-secondary/50 transition-colors animate-fade-up [animation-delay:200ms]">
          <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
              <BarChart2 size={20} />
            </div>
            <span className="text-textStrong font-medium text-sm">Est. Monthly Usage</span>
          </div>
          <div className="z-10 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-textStrong">{stats.monthlyWater.toFixed(0)}</span>
              <span className="text-textMuted text-sm">Litres</span>
            </div>
            <p className="text-secondary text-sm font-medium mt-2">This Month</p>
          </div>
          <WaveGraphic color="var(--color-secondary)" />
        </div>

        {/* Daily Goal */}
        <div className="bg-card rounded-2xl p-5 border border-cardBorder relative overflow-hidden flex flex-col justify-between h-40 group hover:border-warning/50 transition-colors animate-fade-up [animation-delay:300ms]">
          <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-warning/20 rounded-lg text-warning">
              <Target size={20} />
            </div>
            <span className="text-textStrong font-medium text-sm">Daily Goal</span>
          </div>
          <div className="z-10 mt-1">
            <span className="text-4xl font-bold text-textStrong">{stats.goalPercentage}%</span>
            <p className="text-textMuted text-sm font-medium mt-1">{stats.todayWater.toFixed(0)} / 200 Litres</p>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden mt-2 z-10">
            <div className="h-full bg-warning rounded-full shadow-[0_0_10px_var(--color-warning)]" style={{ width: `${stats.goalPercentage}%` }}></div>
          </div>
        </div>

      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-cardBorder animate-fade-up [animation-delay:400ms]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-textStrong">Weekly Usage Overview</h2>
            <select className="bg-background border border-cardBorder text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-secondary transition-colors">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsagePurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="var(--color-text-muted)" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="var(--color-text-muted)" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    borderColor: 'var(--color-card-border)',
                    borderRadius: '12px',
                    color: 'var(--color-text-strong)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorUsagePurple)" 
                  activeDot={{ r: 6, fill: '#a855f7', stroke: 'var(--color-card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-card rounded-2xl p-6 border border-cardBorder flex flex-col animate-fade-up [animation-delay:500ms]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-secondary" />
              <h2 className="text-lg font-bold text-textStrong">AI Insight</h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              <span className="text-accent text-xs font-semibold uppercase tracking-wider">Normal</span>
            </div>
          </div>
          
          <h3 className="text-accent font-bold text-xl mb-2">Everything looks good!</h3>
          <p className="text-text text-sm mb-6">Your water usage is within the normal range. Keep it up! 🌱</p>
          
          <div className="flex flex-col gap-3 mb-6 flex-1">
            <div className="bg-background rounded-xl p-4 border border-cardBorder flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Droplet size={20} />
              </div>
              <div className="flex-1">
                <p className="text-textMuted text-xs font-semibold mb-0.5">Likely Activity</p>
                <div className="flex justify-between items-center">
                  <p className="text-textStrong font-bold text-sm">Bathing</p>
                  <p className="text-textMuted text-xs">Confidence: 94%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-cardBorder flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <Leaf size={20} />
              </div>
              <div className="flex-1">
                <p className="text-textStrong font-bold text-sm mb-1">Recommendation</p>
                <p className="text-textMuted text-xs leading-relaxed">Great job! Continue monitoring to maintain efficient usage.</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => setActiveTab('Copilot')} className="w-full py-3 rounded-xl border border-secondary/50 text-secondary font-semibold hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2">
            View Detailed Analysis
            <ArrowRight size={18} />
          </button>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Live Flow Monitor (Custom Gauge + Wave) */}
        <div className="bg-card rounded-2xl p-6 border border-cardBorder flex flex-col md:flex-row gap-8 animate-fade-up [animation-delay:600ms]">
          <div className="flex-1 flex flex-col justify-between">
            <h2 className="text-lg font-bold text-textStrong mb-6">Live Flow Monitor</h2>
            
            <div className="relative w-48 h-24 mx-auto mb-4">
              {/* SVG Gauge Background */}
              <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--color-card-border)" strokeWidth="8" strokeLinecap="round" />
                {/* SVG Gauge Foreground - Multi-colored stroke */}
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray="125" strokeDashoffset="40" className="drop-shadow-[0_0_5px_var(--color-primary)]" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex flex-col items-center">
                <span className="text-3xl font-bold text-textStrong">{liveData.flowRate.toFixed(2)}</span>
                <span className="text-textMuted text-sm">L/min</span>
              </div>
              <span className="absolute bottom-0 left-0 text-textMuted text-xs font-bold">0</span>
              <span className="absolute bottom-0 right-0 text-textMuted text-xs font-bold">20</span>
            </div>
            
            <div className="flex flex-col items-center mt-auto text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${liveData.status === 'FLOWING' ? 'bg-accent animate-pulse' : 'bg-textMuted'}`}></span>
                <span className="text-textStrong font-semibold">Status: <span className={liveData.status === 'FLOWING' ? "text-accent" : "text-textMuted"}>{liveData.status}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <span>Last updated: {liveData.lastUpdated}</span>
                <RefreshCw size={12} className="cursor-pointer hover:text-textStrong" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 border-t md:border-t-0 md:border-l border-cardBorder pt-6 md:pt-0 md:pl-6 flex items-center justify-center relative overflow-hidden">
             {/* Small live wave chart mock */}
             <div className="w-full h-32 opacity-70">
                <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 L200,100 L0,100 Z" fill="var(--color-primary)" fillOpacity="0.1" />
                  <path d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50" fill="none" stroke="var(--color-primary)" strokeWidth="3" className="drop-shadow-[0_0_4px_var(--color-primary)]" />
                  
                  {/* Second trailing wave */}
                  <path d="M0,60 Q35,90 70,60 T140,60 T200,60" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeOpacity="0.4" />
                </svg>
             </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card rounded-2xl p-6 border border-cardBorder flex flex-col animate-fade-up [animation-delay:700ms]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-textStrong">Recent Alerts</h2>
            <button onClick={() => setActiveTab('Alerts')} className="text-secondary text-sm font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Alert 1 */}
            <div className="bg-background rounded-xl p-4 border border-cardBorder flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-danger/10 text-danger group-hover:scale-110 transition-transform">
                  <Droplet size={20} />
                </div>
                <div>
                  <h4 className="text-danger font-semibold text-sm">High flow rate detected</h4>
                  <p className="text-textMuted text-xs mt-0.5">09:15 AM • 18 minutes</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold border border-danger/20">High</span>
            </div>
            
            {/* Alert 2 */}
            <div className="bg-background rounded-xl p-4 border border-cardBorder flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-warning/10 text-warning group-hover:scale-110 transition-transform">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-warning font-semibold text-sm">Unusual usage at night</h4>
                  <p className="text-textMuted text-xs mt-0.5">02:14 AM • 12 minutes</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold border border-warning/20">Medium</span>
            </div>
          </div>
        </div>

      </div>

      {/* Banner Row */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#172554] rounded-2xl p-6 border border-secondary/30 flex items-center gap-4 relative overflow-hidden animate-fade-up [animation-delay:800ms] shadow-lg">
        <div className="p-3 bg-secondary/20 rounded-full text-secondary backdrop-blur-md relative z-10 border border-secondary/30">
          <Droplet size={24} />
        </div>
        <div className="relative z-10">
          <h3 className="text-secondary font-bold text-lg">Save Water, Save Tomorrow!</h3>
          <p className="text-slate-300 text-sm">Small steps today, big impact tomorrow.</p>
        </div>
        
        {/* Decorative Globe Illustration Mock */}
        <div className="absolute right-0 -bottom-8 opacity-40 mix-blend-screen pointer-events-none w-48 h-48">
           <svg viewBox="0 0 100 100" className="w-full h-full text-secondary">
             <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2" />
             <path d="M50,10 A40,40 0 0,0 50,90 A15,40 0 0,0 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
             <path d="M10,50 A40,40 0 0,0 90,50" fill="none" stroke="currentColor" strokeWidth="2" />
             {/* Small leaves/drops */}
             <path d="M20,30 Q30,10 40,30 Q30,50 20,30" fill="var(--color-primary)" opacity="0.8" />
             <path d="M70,70 Q80,50 90,70 Q80,90 70,70" fill="var(--color-primary)" opacity="0.8" />
           </svg>
        </div>
      </div>

    </div>
  );
}
