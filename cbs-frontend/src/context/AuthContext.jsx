import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, errMsg } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cbs_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // On mount, if we have a token, verify it via /auth/me
  useEffect(() => {
    const token = localStorage.getItem('cbs_token');
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data?.data) {
          setUser(data.data);
          localStorage.setItem('cbs_user', JSON.stringify(data.data));
        }
      } catch {
        // 401 handler in interceptor will clear storage
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, user: u } = data.data;
      localStorage.setItem('cbs_token', token);
      localStorage.setItem('cbs_user', JSON.stringify(u));
      setUser(u);
      return u;
    } catch (err) {
      throw new Error(errMsg(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cbs_token');
    localStorage.removeItem('cbs_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
