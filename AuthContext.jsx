import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('shopsphere_user') || localStorage.getItem('shopsphere_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('shopsphere_token') || localStorage.getItem('shopsphere_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
            sessionStorage.setItem('shopsphere_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { user: loggedInUser, token: authToken } = res.data.data;
      setUser(loggedInUser);
      setToken(authToken);
      sessionStorage.setItem('shopsphere_token', authToken);
      sessionStorage.setItem('shopsphere_user', JSON.stringify(loggedInUser));
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword });
    if (res.data?.success && res.data?.data) {
      const { user: registeredUser, token: authToken } = res.data.data;
      setUser(registeredUser);
      setToken(authToken);
      sessionStorage.setItem('shopsphere_token', authToken);
      sessionStorage.setItem('shopsphere_user', JSON.stringify(registeredUser));
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('shopsphere_token');
    sessionStorage.removeItem('shopsphere_user');
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
  };

  const updateProfile = async (name) => {
    const res = await api.put('/auth/profile', { name });
    if (res.data?.success && res.data?.data?.user) {
      const updated = res.data.data.user;
      setUser(updated);
      sessionStorage.setItem('shopsphere_user', JSON.stringify(updated));
      return res.data;
    }
    throw new Error(res.data?.message || 'Failed to update profile');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
