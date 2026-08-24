import React, { useState, useEffect } from 'react';
import { 
  Droplets, Activity, History, Settings, Bell, Sparkles
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import UsageHistoryView from './components/UsageHistoryView';
import AlertsView from './components/AlertsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import CopilotView from './components/copilot/CopilotView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hasActiveAlert, setHasActiveAlert] = useState(false);
  
  // Theme state (default dark)
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Apply theme attribute to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);
  const handleLogout = () => setIsAuthenticated(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'Usage History':
        return <UsageHistoryView />;
      case 'Alerts':
        return <AlertsView />;
      case 'Settings':
        return <SettingsView isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
      case 'Copilot':
        return <CopilotView setActiveTab={setActiveTab} />;
      default:
        return <DashboardView />;
    }
  };

  // If not logged in, show login screen
  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden text-text bg-transparent selection:bg-primary selection:text-white font-['Outfit']">
      
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-cardBorder bg-background p-6 relative z-10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-12">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/20">
            <Droplets size={26} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide">
            <span className="text-textStrong">Aqua</span>
            <span className="text-accent">Sense</span>
          </span>
        </div>
        
        <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-4 px-2">Main Menu</p>
        
        <nav className="flex flex-col gap-2">
          {['Dashboard', 'Copilot', 'Usage History', 'Alerts', 'Settings'].map((item, index) => {
            const icons = [<Activity size={20} />, <Sparkles size={20} />, <History size={20} />, <Bell size={20} />, <Settings size={20} />];
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-out group
                  ${isActive 
                    ? 'bg-card border border-cardBorder text-textStrong shadow-sm' 
                    : 'text-textMuted hover:text-textStrong hover:bg-card/50'
                  }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                  {icons[index]}
                </div>
                {item}
              </button>
            )
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-cardBorder">
          <div className="flex items-center gap-3 px-2 cursor-pointer group">
             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white shadow-lg">
                SR
             </div>
             <div className="flex flex-col text-sm text-left flex-1">
                <span className="font-semibold text-textStrong group-hover:text-primary transition-colors">Srijith R</span>
                <span className="text-textMuted text-xs">Home Admin</span>
             </div>
             <div className="text-textMuted">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative scroll-smooth bg-background">

        {/* Dynamic View Rendering */}
        {renderActiveView()}

      </main>
    </div>
  );
}

export default App;
