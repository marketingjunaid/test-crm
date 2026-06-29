import React, { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, saveNotifications } from '../../store/storage';
import ThemeToggle from '../UI/ThemeToggle';
import KeyboardShortcutsModal from '../UI/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { seedNotifications } from '../../utils/notifications';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [notifs, setNotifs] = useState(getNotifications());
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => { seedNotifications(); setNotifs(getNotifications()); }, []);
  useKeyboardShortcuts(() => setShowShortcuts(true));

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifs(updated);
    setShowNotifs(false);
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-6 gap-3 sticky top-0 z-20">
      <ThemeToggle />
      {/* Notifications */}
      <div className="relative">
        <button onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
          className="relative p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
        </button>
        {showNotifs && (
          <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 z-50">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700">Mark all read</button>
            </div>
            {notifs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No notifications</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifs.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${n.read ? '' : 'bg-indigo-50/50'}`}>
                    <p className="text-xs font-medium text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{currentUser?.name}</span>
        </button>
        {showUser && (
          <div className="absolute right-0 top-11 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 z-50 py-1">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-900">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500">{currentUser?.role}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
              <LogOut size={14} /><span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
      {showUser && <div className="fixed inset-0 z-40" onClick={() => setShowUser(false)} />}
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </header>
  );
};
