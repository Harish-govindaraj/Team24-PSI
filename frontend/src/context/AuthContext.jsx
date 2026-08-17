import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Production systems should prefer secure httpOnly cookies.
const TOKEN_KEY = 'jwt_token';

const AuthContext = createContext({
  token: null,
  user: null,
  role: null,
  verificationStatus: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  register: () => {}
});

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Replace URL-safe characters and pad with '='
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    // Decode payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);

    // Hardened defensive checks
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.sub || typeof parsed.sub !== 'string') return null;
    if (!parsed.role || typeof parsed.role !== 'string') return null;
    if (parsed.exp === undefined || typeof parsed.exp !== 'number' || isNaN(parsed.exp)) return null;

    return {
      id: parsed.userId,
      fullName: parsed.fullName,
      email: parsed.sub,
      role: parsed.role,
      verificationStatus: parsed.verificationStatus,
      expiry: parsed.exp
    };
  } catch (e) {
    console.error('Invalid JWT format', e);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    role: null,
    verificationStatus: null,
    isAuthenticated: false
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthState({
      token: null,
      user: null,
      role: null,
      verificationStatus: null,
      isAuthenticated: false
    });
  }, []);

  const login = useCallback((token) => {
    const decoded = decodeJwtPayload(token);

    if (!decoded) {
      logout();
      return;
    }

    // Check if expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.expiry && decoded.expiry < currentTime) {
      logout();
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    setAuthState({
      token,
      user: { 
        id: decoded.id, 
        fullName: decoded.fullName, 
        email: decoded.email 
      },
      role: decoded.role,
      verificationStatus: decoded.verificationStatus,
      isAuthenticated: true
    });
  }, [logout]);

  const register = useCallback(() => {
    // Placeholder: API integration to be done in Phase 4.4
    console.warn('Register not yet implemented');
  }, []);

  // Initialize state from localStorage on startup and listen for unauthorized events
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      login(storedToken);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
