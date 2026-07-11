import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import { logout } from '../store/authSlice.js';

const DashboardLayout = () => {
  const { isAuthenticated, user, store } = useSelector((state) => state.auth);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sync theme to DOM body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isExpired = store && store.subscriptionStatus === 'expired';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar navigation */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
        onLogout={handleLogout}
        darkMode={darkMode}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Subscription Expired Warning Banner */}
        {isExpired && user.role !== 'superadmin' && (
          <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white py-2 px-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold z-40 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 animate-bounce" />
              <span>Your Eyelitz subscription has expired. Clinic services are locked until subscription is renewed.</span>
            </div>
            {user.role === 'owner' ? (
              <button 
                onClick={() => navigate('/billing')}
                className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                Renew Subscription
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-xs bg-red-700/40 px-2 py-0.5 rounded">Please contact Store Owner</span>
            )}
          </div>
        )}

        <Header 
          onMenuToggle={() => setIsMobileSidebarOpen(true)} 
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />
        
        {/* Child Router View */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
