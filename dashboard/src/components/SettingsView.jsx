import React, { useState } from 'react';
import { Moon, Sun, Lock, LogOut, BellRing, Mail, User } from 'lucide-react';

export default function SettingsView({ isDarkTheme, toggleTheme, onLogout }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-8 animate-fade-up max-w-4xl">
      
      {/* Header */}
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-text mb-2">Settings & Preferences</h2>
        <p className="text-textMuted">Manage your account, notifications, and system appearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Appearance Settings */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-text border-b border-cardBorder pb-4">
            <Sun size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Appearance</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Theme Preference</p>
              <p className="text-sm text-textMuted">Switch between Light and Dark mode</p>
            </div>
            
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isDarkTheme ? 'bg-primary' : 'bg-textMuted'}`}
            >
              <span className="sr-only">Toggle theme</span>
              <span 
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white transition-transform ${isDarkTheme ? 'translate-x-7' : 'translate-x-1'}`}
              >
                {isDarkTheme ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-textMuted" />}
              </span>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-text border-b border-cardBorder pb-4">
            <BellRing size={20} className="text-accent" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Push Notifications</p>
              <p className="text-sm text-textMuted">Receive alerts on your device</p>
            </div>
            <button 
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${pushEnabled ? 'bg-accent' : 'bg-cardBorder'}`}
            >
              <span className={`inline-block h-6 w-6 rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Email Alerts</p>
              <p className="text-sm text-textMuted">Receive leak summaries via email</p>
            </div>
            <button 
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${emailEnabled ? 'bg-accent' : 'bg-cardBorder'}`}
            >
              <span className={`inline-block h-6 w-6 rounded-full bg-white transition-transform ${emailEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className="glass-panel p-6 flex flex-col gap-6 md:col-span-2">
          <div className="flex items-center gap-3 text-text border-b border-cardBorder pb-4">
            <User size={20} className="text-secondary" />
            <h3 className="text-lg font-semibold">Account Management</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Info */}
            <div className="flex-1 bg-background/50 rounded-xl p-5 border border-cardBorder">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-secondary flex items-center justify-center font-bold text-textStrong text-xl shadow-lg mb-4">
                SR
              </div>
              <h4 className="text-lg font-bold text-text">Srijith R</h4>
              <p className="text-sm text-textMuted mb-1">srijith@example.com</p>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Home Admin</p>
            </div>
            
            {/* Actions */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <button className="flex items-center justify-between p-4 rounded-xl bg-card border border-cardBorder hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3 text-text">
                  <Lock size={18} className="text-textMuted group-hover:text-primary transition-colors" />
                  <span className="font-medium">Change Password</span>
                </div>
                <span className="text-textMuted group-hover:text-primary transition-colors">→</span>
              </button>
              
              <button 
                onClick={onLogout}
                className="flex items-center justify-between p-4 rounded-xl bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-colors group"
              >
                <div className="flex items-center gap-3 text-danger">
                  <LogOut size={18} />
                  <span className="font-medium">Log Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
