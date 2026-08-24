import React, { useState, useEffect } from 'react';
import { fetchAlerts, markAlertRead, markAlertUnread } from '../services/api';
import { AlertTriangle, Droplets, CheckCircle2, Clock, Info } from 'lucide-react';

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAlertTab, setActiveAlertTab] = useState('unread'); // 'unread' or 'read'

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const updatedAlerts = await markAlertRead(id);
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkUnread = async (id) => {
    try {
      const updatedAlerts = await markAlertUnread(id);
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Failed to mark unread", error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredAlerts = alerts.filter(a => activeAlertTab === 'unread' ? !a.isRead : a.isRead);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textStrong mb-2">System Alerts & Notifications</h2>
          <p className="text-textMuted">Monitoring your household water network for leaks and anomalies.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-background border border-cardBorder p-1 rounded-xl">
          <button 
            onClick={() => setActiveAlertTab('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeAlertTab === 'unread' 
                ? 'bg-card text-textStrong shadow-sm border border-cardBorder' 
                : 'text-textMuted hover:text-textStrong hover:bg-card/50'
            }`}
          >
            Unread ({alerts.filter(a => !a.isRead).length})
          </button>
          <button 
            onClick={() => setActiveAlertTab('read')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeAlertTab === 'read' 
                ? 'bg-card text-textStrong shadow-sm border border-cardBorder' 
                : 'text-textMuted hover:text-textStrong hover:bg-card/50'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-textMuted animate-pulse">
            Fetching active alerts from MongoDB...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-panel p-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={48} className="text-accent mb-4 opacity-80" />
            <h3 className="text-xl font-semibold text-textStrong mb-2">
              {activeAlertTab === 'unread' ? 'All Clear!' : 'No Read Alerts'}
            </h3>
            <p className="text-textMuted">
              {activeAlertTab === 'unread' 
                ? 'No leaks or high consumption events detected.' 
                : 'You have no previously read alerts (they expire after 24 hours).'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';
            
            return (
              <div 
                key={alert.id} 
                className={`glass-panel p-6 flex flex-col sm:flex-row gap-5 items-start transition-transform hover:-translate-y-1 animate-fade-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon Badge */}
                <div className={`p-3 rounded-2xl flex-shrink-0 ${
                  isHigh ? 'bg-danger/10 text-danger border border-danger/20' : 
                  isMedium ? 'bg-warning/10 text-warning border border-warning/20' : 
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {alert.type === 'leak' ? <AlertTriangle size={28} /> : <Droplets size={28} />}
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                    <h3 className={`text-lg font-bold ${isHigh ? 'text-danger' : isMedium ? 'text-warning' : 'text-primary'}`}>
                      {alert.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-textMuted bg-background/50 px-2.5 py-1 rounded-full border border-cardBorder w-fit">
                      <Clock size={12} />
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-text leading-relaxed mb-4">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    {!alert.isRead && (
                      <button 
                        onClick={() => handleMarkRead(alert.id)}
                        className="text-sm font-semibold px-4 py-2 rounded-xl bg-background border border-cardBorder hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-textStrong transition-all"
                      >
                        Mark as Read
                      </button>
                    )}
                    {!alert.isRead && (
                       <span className="flex items-center gap-1.5 text-xs text-textMuted font-medium">
                          <Info size={14} className="text-primary" /> Action Required
                       </span>
                    )}
                  </div>
                </div>

                {/* Status indicator line */}
                {!alert.isRead && (
                  <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
