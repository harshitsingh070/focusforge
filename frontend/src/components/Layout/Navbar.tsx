import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/badges', label: 'Badges' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
  { to: '/rules', label: 'Rules' },
];

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = isAdminEmail(user?.email)
    ? [...baseNavItems, { to: '/admin', label: 'Admin' }]
    : baseNavItems;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
      isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-white hover:text-primary-700',
    ].join(' ');

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="rounded-xl bg-primary-100 px-2 py-1 text-sm font-black text-primary-700">FF</span>
            <div>
              <p className="font-display text-lg font-bold text-gray-900">FocusForge</p>
              <p className="hidden text-xs text-ink-muted sm:block">Consistency Engine</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right">
              <p className="text-xs text-ink-muted">Signed in as</p>
              <p className="max-w-[12rem] truncate text-sm font-semibold text-gray-800">{user?.username}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary px-3 py-2">
              Logout
            </button>
          </div>

          <button
            type="button"
            className="btn-secondary px-3 py-2 lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {mobileOpen && (
          <div className="pb-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="app-divider mt-4 flex items-center justify-between pt-4">
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Signed in as</p>
                <p className="truncate text-sm font-semibold text-gray-800">{user?.username}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
