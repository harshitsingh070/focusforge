import { UserPreferences } from '../types';

const SETTINGS_PREFERENCES_KEY = 'focusforge.userPreferences';

export type AppTheme = UserPreferences['theme'];

const isValidTheme = (value: unknown): value is AppTheme =>
  value === 'system' || value === 'light' || value === 'dark';

const resolveSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: AppTheme): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const resolvedTheme = theme === 'system' ? resolveSystemTheme() : theme;

  root.dataset.theme = theme;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light');
  root.style.colorScheme = resolvedTheme;
};

export const readStoredTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const raw = localStorage.getItem(SETTINGS_PREFERENCES_KEY);
  if (!raw) {
    return 'system';
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return isValidTheme(parsed.theme) ? parsed.theme : 'system';
  } catch {
    return 'system';
  }
};
