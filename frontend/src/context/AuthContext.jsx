import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login, logout, register } from '../services/auth.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('nexform_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nexform_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('nexform_token', token);
    } else {
      localStorage.removeItem('nexform_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexform_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexform_user');
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Falha ao carregar utilizador atual', error);
        setToken(null);
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: async (credentials) => {
        const data = await login(credentials);
        setToken(data.token);
        setUser(data.user);
        return data;
      },
      register: async (payload) => {
        const data = await register(payload);
        setToken(data.token);
        setUser(data.user);
        return data;
      },
      logout: () => {
        logout();
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
