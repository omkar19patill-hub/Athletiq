import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/profile')
        .then((res) => {
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      const authData = res.data;
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      const userData = {
        id: authData.userId,
        firstName: authData.firstName,
        lastName: authData.lastName,
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return authData;
    }
    throw new Error(res.message);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.success) {
      const authData = res.data;
      localStorage.setItem('token', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      const userData = {
        id: authData.userId,
        firstName: authData.firstName,
        lastName: authData.lastName,
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return authData;
    }
    throw new Error(res.message);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
