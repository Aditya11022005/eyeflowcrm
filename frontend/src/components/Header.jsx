import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Menu, Sun, Moon, Bell, Sparkles } from 'lucide-react';
import api from '../utils/api.js';

const Header = ({ onMenuToggle }) => {
  const { user, store } = useSelector((state) => state.auth);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync theme to DOM
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (user && user.role !== 'superadmin') {
          const res = await api.get('/reports/dashboard');
          if (res.data.success) {
            setNotifications(res.data.notifications || []);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every min
    return () => clearInterval(interval);
  }, [user]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const getSubscriptionPill = () => {
    if (!store) return null;
    const now = new Date();
    
    if (store.subscriptionStatus === 'active') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/55 rounded-full">
          <Sparkles className="w-3 h-3" />
          Pro Plan
        </span>
      );
    } else if (store.subscriptionStatus === 'trial') {
      const trialEnd = new Date(store.trialEndDate);
      const diffTime = trialEnd - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-clinic-600 bg-clinic-50 dark:text-clinic-400 dark:bg-clinic-950/20 border border-clinic-200 dark:border-clinic-900/55 rounded-full">
          Trial: {diffDays > 0 ? `${diffDays} days left` : 'Expired'}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/55 rounded-full animate-pulse">
          Subscription Expired
        </span>
      );
    }
  };

  const markAsRead = async (id) => {
    try {
      // Mock or call read endpoint, then remove from view
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-darkbg-100/70 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>
        {store && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{store.name}</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Eye & Optometry Suite</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* SaaS Subscription Info */}
        {getSubscriptionPill()}

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Popover */}
        {user && user.role !== 'superadmin' && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-50 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">System Alerts</h3>
                  <span className="text-[10px] font-bold text-clinic-500 bg-clinic-50 px-2 py-0.5 rounded-full dark:bg-clinic-950/20">
                    {unreadCount} New
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center py-6 text-slate-400">All systems operational. No new alerts.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n._id} 
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => markAsRead(n._id)}
                      >
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
