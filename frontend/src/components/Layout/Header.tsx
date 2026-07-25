import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LogOut, ChevronDown, Menu } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  onToggleSidebar?: () => void;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onToggleSidebar, userName }) => {
  const [isDark, setIsDark] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved !== 'light';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <header className="h-14 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-white/5 px-4 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all md:hidden">
            <Menu size={18} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            M
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">MindFlow</h1>
            <p className="text-[10px] text-gray-400 leading-tight">AI Workspace</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold">
              {userName ? userName[0].toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
              {userName || 'Account'}
            </span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10">
                <p className="text-xs text-gray-500">Theme</p>
                <div className="flex gap-1 mt-1.5">
                  {['Light','Dark'].map((t) => (
                    <button key={t}
                      onClick={() => { if ((t === 'Dark') !== isDark) toggleTheme(); setProfileOpen(false); }}
                      className={`flex-1 text-xs py-1 rounded-lg transition-all ${
                        (t === 'Dark') === isDark
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { onLogout(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
