import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, Calendar, Eye, 
  Glasses, Package, Receipt, Shield, LogOut, Settings, Megaphone, HelpCircle, FlaskConical
} from 'lucide-react';
import eyelitzLogo from '../assets/eyelitz_logo.png';

const Sidebar = ({ isMobileOpen, onClose, onLogout }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) return null;

  const role = user.role;

  // Navigation schema based on roles
  const menuItems = [];

  if (role === 'superadmin') {
    menuItems.push({
      path: '/admin',
      name: 'SaaS Admin Panel',
      icon: <Shield className="w-5 h-5" />,
    });
  } else {
    // Normal store staff navigation
    menuItems.push({
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    });

    menuItems.push({
      path: '/patients',
      name: 'Patients',
      icon: <Users className="w-5 h-5" />,
    });

    menuItems.push({
      path: '/appointments',
      name: 'Appointments',
      icon: <Calendar className="w-5 h-5" />,
    });

    menuItems.push({
      path: '/checkups',
      name: 'Eye Checkups',
      icon: <Eye className="w-5 h-5" />,
    });

    // Orders, inventory, and billing are typically visible to owner and receptionist/staff
    if (['owner', 'staff'].includes(role)) {
      menuItems.push({
        path: '/orders',
        name: 'Glasses Orders',
        icon: <Glasses className="w-5 h-5" />,
      });

      menuItems.push({
        path: '/partners',
        name: 'Lab Partners',
        icon: <FlaskConical className="w-5 h-5" />,
      });

      menuItems.push({
        path: '/inventory',
        name: 'Inventory',
        icon: <Package className="w-5 h-5" />,
      });

      menuItems.push({
        path: '/billing',
        name: 'Billing & Invoices',
        icon: <Receipt className="w-5 h-5" />,
      });

      menuItems.push({
        path: '/marketing',
        name: 'Marketing Engine',
        icon: <Megaphone className="w-5 h-5" />,
      });
    }

    // Settings is visible to all clinic staff (owners can edit clinic info too)
    menuItems.push({
      path: '/settings',
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    });

    menuItems.push({
      path: '/helpdesk',
      name: 'Help Desk',
      icon: <HelpCircle className="w-5 h-5" />,
    });
  }

  const baseLinkClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white";
  const activeLinkClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-clinic-500 text-white shadow-md shadow-clinic-500/20 dark:shadow-none hover:bg-clinic-600";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding Header */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-slate-100 dark:border-slate-800">
          <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-24 h-24 object-contain" />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase mt-2">
            {role === 'superadmin' ? 'SaaS System' : 'Clinic Suite'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}
              onClick={onClose}
            >
              {item.icon}
              <span className="text-sm font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 capitalize">{role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
