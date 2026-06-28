import React, { createContext, useContext, useState } from 'react';
import type { AppUser, AppSection } from '../types';
import { getUsers, saveUsers, getAnnouncements, saveAnnouncements } from '../store/storage';
import { canAccess as _canAccess, resolveAccess } from '../permissions';

interface AuthContextType {
  currentUser: AppUser | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  canAccess: (section: AppSection) => boolean;
  accessibleSections: AppSection[];
  refreshSession: () => void;
  changePassword: (newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

function postWelcomeAnnouncement(user: AppUser) {
  const announcements = getAnnouncements();
  saveAnnouncements([{
    id: Date.now().toString(),
    title: `Welcome to the team, ${user.name}! 🎉`,
    content: `Please join us in welcoming ${user.name} (${user.department}) who has just logged in for the first time. Welcome aboard!`,
    department: 'All',
    priority: 'Important',
    pinned: false,
    createdBy: 'System',
    createdAt: new Date().toISOString(),
  }, ...announcements]);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try { const s = localStorage.getItem('orgos_session'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    try { const s = localStorage.getItem('orgos_session'); return s ? JSON.parse(s)?.mustChangePassword === true : false; } catch { return false; }
  });

  const login = (email: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.status === 'Active');
    if (!user) return false;

    // First ever login — post welcome announcement and mark as logged in
    if (!user.hasLoggedIn) {
      const updated = users.map(u => u.id === user.id ? { ...u, hasLoggedIn: true } : u);
      saveUsers(updated);
      const freshUser = { ...user, hasLoggedIn: true };
      setCurrentUser(freshUser);
      localStorage.setItem('orgos_session', JSON.stringify(freshUser));
      postWelcomeAnnouncement(freshUser);
    } else {
      setCurrentUser(user);
      localStorage.setItem('orgos_session', JSON.stringify(user));
    }

    setMustChangePassword(user.mustChangePassword === true);
    return true;
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return;
    const users = getUsers();
    const updated = users.map(u =>
      u.id === currentUser.id ? { ...u, password: newPassword, mustChangePassword: false } : u
    );
    saveUsers(updated);
    const freshUser = { ...currentUser, password: newPassword, mustChangePassword: false };
    setCurrentUser(freshUser);
    localStorage.setItem('orgos_session', JSON.stringify(freshUser));
    setMustChangePassword(false);
  };

  const logout = () => { setCurrentUser(null); setMustChangePassword(false); localStorage.removeItem('orgos_session'); };

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
    <AuthContext.Provider value={{ currentUser, mustChangePassword, login, logout, canAccess: canAccessFn, accessibleSections, refreshSession, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
