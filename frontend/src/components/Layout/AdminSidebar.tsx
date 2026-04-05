import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import CircularLogo from '../ui/CircularLogo';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  displayName: string;
  initials: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapsed,
  displayName,
  initials,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const isAdminActive = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  return (
    <aside
      className={`
        hidden lg:flex flex-col justify-between shrink-0
        lg:h-[100dvh] lg:sticky lg:top-0 z-50
        border-r border-violet-200/40 dark:border-violet-900/20
        bg-white dark:bg-slate-900
        transition-all duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo area with Discipify badge */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-violet-200/40 dark:border-violet-900/20 px-4 gap-2.5">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2.5 group w-full min-w-0"
        >
          <CircularLogo size="md" />
          {!collapsed && (
            <div className="flex flex-col gap-0 min-w-0">
              <span className="text-xs font-bold tracking-wider text-violet-600 dark:text-violet-400">ADMIN</span>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Discipify</span>
            </div>
          )}
        </button>
      </div>

      {/* Admin Navigation */}
      <div className="flex-1 flex flex-col gap-1 p-3 pt-4 overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          title={collapsed ? 'Admin Dashboard' : undefined}
          className={`
            group relative flex items-center gap-3 rounded-xl px-3 py-2.5
            text-left transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
            ${isAdminActive
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:text-slate-900 dark:hover:text-white'
            }
          `}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">monitoring</span>
          {!collapsed && (
            <span className={`text-sm whitespace-nowrap ${isAdminActive ? 'font-semibold' : 'font-medium'}`}>
              Dashboard
            </span>
          )}
          {/* Tooltip for collapsed mode */}
          {collapsed && (
            <span className="absolute left-full ml-2 hidden group-hover:flex items-center rounded-lg bg-slate-900 dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg z-[60] whitespace-nowrap">
              Dashboard
            </span>
          )}
        </button>
      </div>

      {/* Bottom Section - Logout + Collapse */}
      <div className="border-t border-violet-200/40 dark:border-violet-900/20 p-3 space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            chevron_left
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User card with logout */}
        {!collapsed && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-violet-200/40 dark:border-violet-900/30 bg-gradient-to-br from-violet-50/40 to-purple-50/40 dark:from-violet-950/20 dark:to-purple-950/20 px-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white shadow-sm overflow-hidden">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500 shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold py-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </button>
          </div>
        )}

        {/* Collapsed mode: logout button only */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
