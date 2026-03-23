import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';
import { NAV_ITEMS, ADMIN_NAV_ITEM, isActiveNav } from '../../constants/navigation';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const showDesktopBrand = !(isAuthenticated && onToggleMobileSidebar);
  const displayName = user?.username || user?.email || 'User';
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((t: string) => t[0]?.toUpperCase() || '')
    .join('') || 'FF';
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navItems = isAdminEmail(user?.email)
    ? [...NAV_ITEMS, ADMIN_NAV_ITEM]
    : NAV_ITEMS;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav
      className={`
        sticky top-0 z-40 w-full transition-all duration-300
        ${scrolled
          ? 'border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm'
          : 'border-b border-slate-200/40 dark:border-slate-800/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md'
        }
      `}
    >
      <div className="mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger — only shown when onToggleMobileSidebar is provided */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className={`items-center gap-2.5 group ${showDesktopBrand ? 'flex' : 'flex md:hidden'}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-105">
              FF
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:block">
              FocusForge
            </span>
          </Link>
        </div>

        {/* Center: Desktop nav links (only when authenticated and no sidebar) */}
        {isAuthenticated && !onToggleMobileSidebar && (
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActiveNav(location.pathname, item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`
                      rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                      ${active
                        ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <span
              className="absolute transition-all duration-500"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </span>
            <span
              className="absolute transition-all duration-500"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </span>
          </button>

          {/* User pill & Logout — desktop */}
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2.5 rounded-full bg-slate-100 dark:bg-slate-800/60 p-1.5 pr-4 border border-slate-200/80 dark:border-slate-700/50 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[11px] font-bold text-white shadow-sm">
                  {initials}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {displayName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white sm:flex"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden h-[38px] items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-purple-500 sm:flex"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
