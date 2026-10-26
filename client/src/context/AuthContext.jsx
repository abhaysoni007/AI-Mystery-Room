import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('ai_mystery_token') : null;
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Load current user profile if token is present
  useEffect(() => {
    let isMounted = true;
    if (token) {
      api.setAuthToken(token);
      api
        .getMe()
        .then((userData) => {
          if (isMounted && userData) {
            setUser(userData);
          }
        })
        .catch(() => {
          if (isMounted) {
            setUser(null);
            setToken(null);
            api.setAuthToken(null);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async ({ username, password }) => {
    const data = await api.login({ username, password });
    if (data?.token) {
      setToken(data.token);
      setUser(data.user);
      api.setAuthToken(data.token);
    }
    return data;
  }, []);

  const signup = useCallback(async ({ username, password, name }) => {
    const data = await api.signup({ username, password, name });
    if (data?.token) {
      setToken(data.token);
      setUser(data.user);
      api.setAuthToken(data.token);
      if (data.user?.hasCompletedWalkthrough === false) {
        setIsWalkthroughOpen(true);
      }
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
    setIsWalkthroughOpen(false);
  }, []);

  const openWalkthrough = useCallback(() => {
    setIsWalkthroughOpen(true);
  }, []);

  const closeWalkthrough = useCallback(() => {
    setIsWalkthroughOpen(false);
  }, []);

  const completeWalkthrough = useCallback(async () => {
    setIsWalkthroughOpen(false);
    setUser((prev) => (prev ? { ...prev, hasCompletedWalkthrough: true } : prev));
    try {
      await api.updateWalkthrough(true);
    } catch (e) {
      // Silently catch in unauthenticated or offline mode
    }
  }, []);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        isWalkthroughOpen,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        signup,
        logout,
        openWalkthrough,
        closeWalkthrough,
        completeWalkthrough,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      isAuthenticated: true,
      isLoading: false,
      isWalkthroughOpen: false,
      isAuthModalOpen: false,
      authModalMode: 'login',
      setAuthModalMode: () => {},
      login: async () => {},
      signup: async () => {},
      logout: () => {},
      openWalkthrough: () => {},
      closeWalkthrough: () => {},
      completeWalkthrough: () => {},
      openAuthModal: () => {},
      closeAuthModal: () => {},
    };
  }
  return context;
}
