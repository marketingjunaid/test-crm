import { getNotifications, saveNotifications } from '../store/storage';
import type { AppNotification } from '../types';

export function addNotification(
  title: string,
  message: string,
  type: AppNotification['type'],
  link?: string
) {
  const existing = getNotifications();
  const newNotif: AppNotification = {
    id: crypto.randomUUID(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
    link,
  };
  saveNotifications([newNotif, ...existing].slice(0, 50));
}

export function seedNotifications() {
  if (getNotifications().length > 0) return;
  const seeds: Omit<AppNotification, 'id'>[] = [
    {
      title: 'Payroll Processed',
      message: 'December payroll has been processed for all employees',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      title: 'Leave Request Pending',
      message: '3 leave requests are awaiting approval',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      title: 'New Employee Onboarded',
      message: 'Sarah Johnson has completed onboarding',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: 'Invoice Overdue',
      message: 'Invoice INV-0002 is 7 days overdue',
      type: 'error',
      read: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
  saveNotifications(seeds.map(s => ({ ...s, id: crypto.randomUUID() })));
}
