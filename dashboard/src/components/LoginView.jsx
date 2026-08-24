import React, { useState } from 'react';
import { Droplets, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock API call simulation
    setTimeout(() => {
      if (email === 'admin@aquasense.com' && password === 'password123') {
        onLogin();
      } else {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-md animate-fade-up">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-primary to-secondary shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            <Droplets size={32} className="text-textStrong" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide text-text mb-2">
            AquaSense
          </h1>
          <p className="text-textMuted text-center">
            Sign in to access your smart water dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aquasense.com"
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-cardBorder rounded-xl text-text placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-text">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-cardBorder rounded-xl text-text placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Authenticating...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-textMuted mt-8">
          Don't have an account? <a href="#" className="text-primary font-semibold hover:underline">Contact Administrator</a>
        </p>

      </div>
    </div>
  );
}
