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
      <div className="grid gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-white hover:text-primary-700',
              ].join(' ')
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
