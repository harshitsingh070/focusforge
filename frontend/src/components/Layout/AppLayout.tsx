import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { isAdminEmail } from '../../constants/admin';
import { NAV_ITEMS, ADMIN_NAV_ITEM, isActiveNav } from '../../constants/navigation';
import Navbar from './Navbar';

const SIDEBAR_COLLAPSED_KEY = 'ff-sidebar-collapsed';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  const navItems = isAdminEmail(user?.email)
    ? [...NAV_ITEMS, ADMIN_NAV_ITEM]
    : NAV_ITEMS;

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  // Close mobile sidebar on route change
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const displayName = [user?.username, user?.email, 'User'].find(
    (c) => typeof c === 'string' && c.trim().length > 0
  ) as string;
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((t) => t[0]?.toUpperCase() || '')
    .join('') || 'FF';

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 [font-family:'Inter',sans-serif]">
      <Navbar onToggleMobileSidebar={() => setMobileOpen((p) => !p)} />

      <div className="flex h-[calc(100vh-72px)] mt-[72px]">
        {/* ── Desktop Sidebar ── */}
        <aside
          className={`
            hidden md:flex flex-col justify-between shrink-0
            sticky top-0 h-full
            border-r border-slate-200/80 dark:border-slate-800
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            transition-all duration-300 ease-out
            ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          `}
        >
          {/* Nav items */}
          <div className="flex flex-col gap-1 p-3 pt-4 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const active = isActiveNav(location.pathname, item.to);
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-left transition-all duration-200
                    ${collapsed ? 'justify-center' : ''}
                    ${active
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className={`text-sm whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <span className="absolute left-full ml-2 hidden group-hover:flex items-center rounded-lg bg-slate-900 dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg z-50 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom section */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 p-3">
            {/* Collapse toggle */}
            <button
              onClick={toggleCollapsed}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
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

            {/* User card */}
            {!collapsed && (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pro Member</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-[72px] bottom-0 w-[280px] border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 animate-[ff-sheet-enter_220ms_ease_both] overflow-y-auto">
              {navItems.map((item) => {
                const active = isActiveNav(location.pathname, item.to);
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => { navigate(item.to); setMobileOpen(false); }}
                    className={`
                      flex w-full items-center gap-3 rounded-xl px-3 py-3 mb-1
                      text-left text-sm transition-all duration-150
                      ${active
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-md shadow-violet-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}

              {/* Mobile user card */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pro Member</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main Content ── */}
        <main
          className="flex-1 overflow-y-auto transition-all duration-300 ease-out"
        
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
