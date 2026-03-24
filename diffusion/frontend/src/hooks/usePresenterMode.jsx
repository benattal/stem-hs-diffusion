import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STORAGE_KEY = 'presenter-token';

const PresenterModeContext = createContext(null);

export function PresenterModeProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const isPresenter = !!token;

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  // Listen for token changes from other windows (e.g. presenter window login/logout)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) {
        setToken(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const authenticate = useCallback(async (password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        setToken(data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = { isPresenter, token, authenticate, logout };

  return (
    <PresenterModeContext.Provider value={value}>
      {children}
    </PresenterModeContext.Provider>
  );
}

export function usePresenterMode() {
  const ctx = useContext(PresenterModeContext);
  if (!ctx) throw new Error('usePresenterMode must be used within PresenterModeProvider');
  return ctx;
}
