import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { isAdminEmail } from '../../constants/admin';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/goals', label: 'Goals' },
  { to: '/activity', label: 'Activity' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/badges', label: 'Badges' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/settings', label: 'Settings' },
];

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const displayName = user?.username || user?.email || 'Analyst';
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

  return (
    <nav className="ff-navbar">
      <div className="ff-navbar__inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="ff-logo">
          <span className="ff-logo-mark">FF</span>
          FocusForge
        </Link>

        <div className="ff-nav-links">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink key={item.to} to={item.to} className={`ff-nav-link ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="ff-user-pill">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {displayName}
          </span>
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/login')} className="btn-secondary">
              Login
            </button>
          )}
        </div>

        <button
          type="button"
          className="ff-mobile-toggle"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileOpen && (
        <div className="ff-mobile-panel">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink key={item.to} to={item.to} className={`ff-mobile-link ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            );
          })}
          <div className="app-divider my-1" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600">{displayName}</span>
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="btn-secondary">
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
