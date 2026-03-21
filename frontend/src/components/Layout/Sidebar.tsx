import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminEmail } from '../../constants/admin';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/authSlice';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/activity', label: 'Activity', icon: 'event_note' },
  { to: '/analytics', label: 'Analytics', icon: 'monitoring' },
  { to: '/badges', label: 'Badges', icon: 'military_tech' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/rules', label: 'Rules', icon: 'gavel' },
];

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const isActiveNav = (pathname: string, route: string) =>
  pathname === route || (route !== '/dashboard' && pathname.startsWith(route));

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const displayName = [user?.username, user?.email, 'FocusForge User'].find(
    (c) => typeof c === 'string' && c.trim().length > 0
  ) as string;
  const initials = getInitials(displayName);
  const navItems = isAdminEmail(user?.email)
    ? [...baseNavItems, { to: '/admin', label: 'Admin', icon: 'shield_person' }]
    : baseNavItems;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="hidden w-[260px] flex-shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:flex">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-md shadow-violet-500/30">
            <span className="text-sm font-bold text-white">FF</span>
          </div>
          <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">FocusForge</h1>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActiveNav(location.pathname, item.to);
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="mb-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
            {initials}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
