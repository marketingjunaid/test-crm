import React, { createContext, useContext, useState } from 'react';
import type { AppUser, AppSection } from '../types';
import { getUsers } from '../store/storage';
import { canAccess as _canAccess, resolveAccess } from '../permissions';

interface AuthContextType {
  currentUser: AppUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  canAccess: (section: AppSection) => boolean;
  accessibleSections: AppSection[];
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try { const s = localStorage.getItem('orgos_session'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const login = (email: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.status === 'Active');
    if (user) { setCurrentUser(user); localStorage.setItem('orgos_session', JSON.stringify(user)); return true; }
    return false;
  };

  const logout = () => { setCurrentUser(null); localStorage.removeItem('orgos_session'); };

  const refreshSession = () => {
    if (!currentUser) return;
    const users = getUsers();
    const updated = users.find(u => u.id === currentUser.id);
    if (updated) { setCurrentUser(updated); localStorage.setItem('orgos_session', JSON.stringify(updated)); }
  };

  const canAccessFn = (section: AppSection): boolean =>
    currentUser ? _canAccess(currentUser, section) : false;

  const accessibleSections = currentUser ? resolveAccess(currentUser) : [];

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, canAccess: canAccessFn, accessibleSections, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
