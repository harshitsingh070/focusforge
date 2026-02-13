export const ADMIN_EMAIL = 'admin.focusforge@gmail.com';

export const isAdminEmail = (email?: string | null): boolean =>
  typeof email === 'string' && email.trim().toLowerCase() === ADMIN_EMAIL;
