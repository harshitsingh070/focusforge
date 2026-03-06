import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/goals', label: 'Goals' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/badges', label: 'Badges' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
  { to: '/rules', label: 'Rules' },
];

const Sidebar: React.FC = () => (
  <aside className="hidden w-64 shrink-0 lg:block">
    <div className="sticky top-20 card">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Navigation</p>
      <div className="grid gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'sidebar-nav-active'
                : 'sidebar-nav-item'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  </aside>
);

export default Sidebar;
