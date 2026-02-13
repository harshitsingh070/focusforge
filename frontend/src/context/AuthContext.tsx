import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { api, AuthResponse } from '../services/api';

interface User {
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Restore session (FIXED)
  useEffect(() => {
    const restore = async () => {
      // ✅ DO NOT refresh if no auth header exists
      const authHeader = api.defaults.headers.common.Authorization;
      if (!authHeader) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.post<AuthResponse>('/auth/refresh');
        setToken(res.data.accessToken);
        setUser({ email: res.data.email, role: res.data.role });
        api.defaults.headers.common.Authorization =
          `Bearer ${res.data.accessToken}`;
      } catch {
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common.Authorization;
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    setToken(res.data.accessToken);
    setUser({ email: res.data.email, role: res.data.role });

    api.defaults.headers.common.Authorization =
      `Bearer ${res.data.accessToken}`;
  };

  const register = async (email: string, password: string) => {
    await api.post('/auth/register', { email, password });
  };

  // 🔥 Logout (already correct)
  const logout = async () => {
    delete api.defaults.headers.common.Authorization;

    try {
      await api.post(
        '/auth/logout',
        {},
        {
          withCredentials: true,
          headers: { Authorization: '' },
        }
      );
    } catch {
      // ignore – backend token may already be invalid
    } finally {
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common.Authorization;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
