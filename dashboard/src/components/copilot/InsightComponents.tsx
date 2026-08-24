import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Droplet, Sparkles, Leaf, Activity, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
// import { usageBreakdownData, timelineData, recentReports } from '../../services/dummyCopilotData'; 
// Using mock data directly here for now to avoid dependency on dummyData service since we moved to Gemini

const usageBreakdownData = [
  { name: 'Bathing', value: 45, color: '#06b6d4' },
  { name: 'Kitchen', value: 25, color: '#10b981' },
  { name: 'Gardening', value: 15, color: '#a855f7' },
  { name: 'Cleaning', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

const timelineData = [
  { id: 1, start: '07:30 AM', end: '07:45 AM', duration: '15m', litres: 42, activity: 'Bathing', color: '#06b6d4' },
  { id: 2, start: '08:15 AM', end: '08:20 AM', duration: '5m', litres: 12, activity: 'Kitchen', color: '#10b981' },
  { id: 3, start: '10:00 AM', end: '10:30 AM', duration: '30m', litres: 35, activity: 'Gardening', color: '#a855f7' },
  { id: 4, start: '01:45 PM', end: '01:50 PM', duration: '5m', litres: 15, activity: 'Cleaning', color: '#f59e0b' },
];

const recentReports = [
  { id: 1, date: 'Aug 05, 2025', activity: 'High Usage', water: '210L', status: 'Review Needed', confidence: '89%' },
  { id: 2, date: 'Aug 04, 2025', activity: 'Normal', water: '145L', status: 'Optimal', confidence: '96%' },
];

interface InsightCardProps {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  delay?: number;
}

export const InsightCard = ({ title, icon: Icon, iconColor, children, delay = 0 }: InsightCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card rounded-2xl p-5 border border-cardBorder shadow-sm mb-4"
  >
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={18} className={iconColor} />}
      <h3 className="text-sm font-bold text-textStrong">{title}</h3>
    </div>
    {children}
  </motion.div>
);

export const UsageSummaryCard = () => (
  <InsightCard title="Usage Summary" icon={Activity} iconColor="text-primary" delay={0.1}>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-textMuted text-xs mb-1">Total Water Used</p>
        <p className="text-textStrong font-bold text-xl">157 <span className="text-sm font-normal text-textMuted">L</span></p>
      </div>
      <div>
        <p className="text-textMuted text-xs mb-1">Sessions</p>
        <p className="text-textStrong font-bold text-xl">4</p>
      </div>
      <div>
        <p className="text-textMuted text-xs mb-1">Avg Flow Rate</p>
        <p className="text-textStrong font-bold text-xl">12.5 <span className="text-sm font-normal text-textMuted">L/min</span></p>
      </div>
      <div>
        <p className="text-textMuted text-xs mb-1">Current Status</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-accent text-sm font-semibold">Normal</span>
        </div>
      </div>
    </div>
  </InsightCard>
);

export const PredictionCard = () => (
  <InsightCard title="AI Prediction" icon={Sparkles} iconColor="text-secondary" delay={0.2}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
          <Droplet size={16} />
        </div>
        <div>
          <p className="text-textStrong font-bold">Bathing</p>
          <p className="text-textMuted text-xs">Likely Activity</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-secondary font-bold text-lg">94%</p>
        <p className="text-textMuted text-xs">Confidence</p>
      </div>
    </div>
    <p className="text-textMuted text-xs mt-3 p-3 bg-background rounded-lg border border-cardBorder">
      Flow rate matches your typical morning shower profile.
    </p>
  </InsightCard>
);

export const RecommendationCard = () => (
  <InsightCard title="AI Recommendation" icon={Leaf} iconColor="text-accent" delay={0.3}>
    <div className="mb-3">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-accent mt-0.5">•</span>
        <p className="text-text text-sm">Cut shower time by 2 mins to save water.</p>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-accent mt-0.5">•</span>
        <p className="text-text text-sm">Consider watering plants in the evening.</p>
      </div>
    </div>
    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
      <div>
        <p className="text-accent text-xs font-semibold">Est. Daily Savings</p>
        <p className="text-accent font-bold text-lg">~25 Litres</p>
      </div>
      <span className="px-2 py-1 bg-accent/20 text-accent text-[10px] font-bold rounded uppercase tracking-wider">High Priority</span>
    </div>
  </InsightCard>
);

export const UsageChartCard = () => (
  <InsightCard title="Consumption Breakdown" icon={PieChart} iconColor="text-warning" delay={0.4}>
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={usageBreakdownData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {usageBreakdownData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--color-text-strong)', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="flex flex-wrap gap-2 mt-2 justify-center">
      {usageBreakdownData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
          <span className="text-textMuted">{item.name}</span>
        </div>
      ))}
    </div>
  </InsightCard>
);

export const TimelineCard = () => (
  <InsightCard title="Daily Timeline" icon={Activity} iconColor="text-primary" delay={0.5}>
    <div className="relative border-l-2 border-cardBorder ml-3 space-y-6 mt-4">
      {timelineData.map((item) => (
        <div key={item.id} className="relative pl-6">
          <div 
            className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-card bg-background"
            style={{ borderColor: item.color }}
          ></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-textStrong font-semibold text-sm">{item.activity}</p>
              <p className="text-textMuted text-xs">{item.start} - {item.end} ({item.duration})</p>
            </div>
            <div className="text-right">
              <p className="text-textStrong font-bold text-sm">{item.litres}L</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </InsightCard>
);

export const HealthScoreCard = () => (
  <InsightCard title="AI Health Score" icon={ShieldCheck} iconColor="text-accent" delay={0.6}>
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-md">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-card-border)" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke="var(--color-accent)" strokeWidth="8" 
            strokeLinecap="round" 
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * 0.85) }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-textStrong">85</span>
        </div>
      </div>
      <div>
        <h4 className="text-textStrong font-bold mb-1">Excellent!</h4>
        <p className="text-textMuted text-xs">Your water efficiency is great today. No leaks detected.</p>
      </div>
    </div>
  </InsightCard>
);

export const ReportCard = () => (
  <InsightCard title="Recent AI Reports" icon={AlertCircle} iconColor="text-secondary" delay={0.7}>
    <div className="space-y-3">
      {recentReports.map(report => (
        <div key={report.id} className="bg-background rounded-xl p-3 border border-cardBorder group cursor-pointer hover:border-secondary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-textMuted text-[10px] uppercase tracking-wider">{report.date}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.status === 'Optimal' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'}`}>
              {report.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-textStrong text-sm font-semibold">{report.activity}</p>
              <p className="text-textMuted text-xs">Usage: {report.water}</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </InsightCard>
);
