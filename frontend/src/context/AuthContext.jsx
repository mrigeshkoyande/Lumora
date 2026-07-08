import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — lightweight mock auth context.
 * No real JWT — manages the "logged in" state for client-side routing.
 * Extend this to integrate a real auth backend in future.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Persist across page refreshes
    try {
      const stored = sessionStorage.getItem('arogya_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, role = 'admin') => {
    const userData = {
      email,
      role,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      loginTime: new Date().toISOString(),
    };
    setUser(userData);
    sessionStorage.setItem('arogya_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('arogya_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
