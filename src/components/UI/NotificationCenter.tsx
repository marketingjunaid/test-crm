import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type { AppNotification } from '../../types';
import { getNotifications, saveNotifications } from '../../store/storage';

function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeConfig: Record<
  AppNotification['type'],
  { icon: React.ReactNode; color: string }
> = {
  info: {
    icon: <Info size={16} />,
    color: 'text-blue-500',
  },
  success: {
    icon: <CheckCircle size={16} />,
    color: 'text-green-500',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    color: 'text-amber-500',
  },
  error: {
    icon: <XCircle size={16} />,
    color: 'text-red-500',
  },
};

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const reload = () => {
    const all = getNotifications();
    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(sorted.slice(0, 10));
  };

  useEffect(() => {
    reload();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const all = getNotifications();
    saveNotifications(all.map(n => ({ ...n, read: true })));
    reload();
  };

  const markRead = (id: string) => {
    const all = getNotifications();
    saveNotifications(all.map(n => (n.id === id ? { ...n, read: true } : n)));
    reload();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Mark all read
            </button>
          </div>

          {/* Body */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Bell size={24} />
              <span className="text-sm">No notifications</span>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
              {notifications.map(n => {
                const cfg = typeConfig[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
