import type { AppSection, AppUser } from './types';

export const ALL_SECTIONS: AppSection[] = [
  'dashboard', 'chat', 'calendar', 'crm', 'hr', 'finance', 'projects',
  'inventory', 'support', 'assets', 'announcements', 'documents', 'settings',
  'selfservice', 'analytics', 'communication',
];

export const SECTION_LABELS: Record<AppSection, string> = {
  dashboard: 'Dashboard',
  chat: 'Team Chat',
  calendar: 'Company Calendar',
  crm: 'CRM (Leads, Contacts, Deals)',
  hr: 'Human Resources',
  finance: 'Finance',
  projects: 'Projects & Tasks',
  inventory: 'Inventory',
  support: 'Support',
  assets: 'Assets',
  announcements: 'Announcements',
  documents: 'Documents',
  settings: 'Settings',
  selfservice: 'My Profile & Org Chart',
  analytics: 'Analytics & Reports',
  communication: 'Communication (Polls & Meetings)',
};

export const ROLE_DEFAULTS: Record<AppUser['role'], AppSection[]> = {
  'Super Admin': [...ALL_SECTIONS],
  'Admin': [...ALL_SECTIONS],
  'Manager': ['dashboard', 'chat', 'calendar', 'crm', 'hr', 'projects', 'inventory', 'support', 'assets', 'announcements', 'documents', 'selfservice', 'analytics', 'communication'],
  'Employee': ['dashboard', 'chat', 'calendar', 'selfservice', 'announcements', 'documents', 'communication'],
};

export function resolveAccess(user: AppUser): AppSection[] {
  return user.sectionOverrides ?? ROLE_DEFAULTS[user.role] ?? ['dashboard'];
}

export function canAccess(user: AppUser, section: AppSection): boolean {
  return resolveAccess(user).includes(section);
}
