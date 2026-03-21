export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/activity', label: 'Activity', icon: 'event_note' },
  { to: '/analytics', label: 'Analytics', icon: 'monitoring' },
  { to: '/badges', label: 'Badges', icon: 'military_tech' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export const ADMIN_NAV_ITEM: NavItem = {
  to: '/admin',
  label: 'Admin',
  icon: 'shield_person',
};

export const isActiveNav = (pathname: string, route: string) =>
  pathname === route || (route !== '/dashboard' && pathname.startsWith(route));
