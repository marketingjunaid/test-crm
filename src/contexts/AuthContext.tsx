import React, { createContext, useContext, useState } from 'react';
import type { AppUser } from '../types';
import { getUsers } from '../store/storage';

interface AuthContextType {
  currentUser: AppUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
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

  return <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>;
};
