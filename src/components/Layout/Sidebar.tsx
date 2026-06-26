import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, DollarSign, Briefcase, Package,
  Headphones, Monitor, Bell, Settings, ChevronDown, ChevronRight,
  TrendingUp, FileText, Building2, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { AppSection } from '../../types';

interface NavItem { label: string; path?: string; icon?: React.ReactNode; children?: NavItem[]; }

const navItems: { section: string; sectionKey: AppSection; items: NavItem[] }[] = [
  { section: 'OVERVIEW', sectionKey: 'dashboard', items: [{ label: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} /> }] },
  { section: 'MESSAGING', sectionKey: 'chat', items: [{ label: 'Team Chat', path: '/chat', icon: <MessageSquare size={16} /> }] },
  { section: 'SALES', sectionKey: 'crm', items: [{ label: 'CRM', icon: <TrendingUp size={16} />, children: [
    { label: 'Leads', path: '/crm/leads' }, { label: 'Contacts', path: '/crm/contacts' },
    { label: 'Companies', path: '/crm/companies' }, { label: 'Deals', path: '/crm/deals' },
  ]}]},
  { section: 'HUMAN RESOURCES', sectionKey: 'hr', items: [{ label: 'HR', icon: <UserCheck size={16} />, children: [
    { label: 'Employees', path: '/hr/employees' }, { label: 'Hiring', path: '/hr/hiring' },
    { label: 'Onboarding', path: '/hr/onboarding' }, { label: 'Leave', path: '/hr/leave' },
    { label: 'Attendance', path: '/hr/attendance' }, { label: 'Payroll', path: '/hr/payroll' },
    { label: 'Performance', path: '/hr/performance' }, { label: 'Documents', path: '/hr/documents' },
  ]}]},
  { section: 'FINANCE', sectionKey: 'finance', items: [{ label: 'Finance', icon: <DollarSign size={16} />, children: [
    { label: 'Invoices', path: '/finance/invoices' }, { label: 'Expenses', path: '/finance/expenses' },
    { label: 'Budget', path: '/finance/budget' }, { label: 'Reports', path: '/finance/reports' },
  ]}]},
  { section: 'WORK', sectionKey: 'projects', items: [{ label: 'Projects', icon: <Briefcase size={16} />, children: [
    { label: 'All Projects', path: '/projects' }, { label: 'Tasks', path: '/projects/tasks' },
    { label: 'Timesheets', path: '/projects/timesheets' },
  ]}]},
  { section: 'INVENTORY', sectionKey: 'inventory', items: [
    { label: 'Inventory', icon: <Package size={16} />, children: [
      { label: 'Products', path: '/inventory/products' }, { label: 'Stock', path: '/inventory/stock' },
      { label: 'Purchase Orders', path: '/inventory/purchase-orders' }, { label: 'Vendors', path: '/inventory/vendors' },
    ]},
  ]},
  { section: 'SUPPORT', sectionKey: 'support', items: [
    { label: 'Support', icon: <Headphones size={16} />, children: [
      { label: 'Tickets', path: '/support/tickets' }, { label: 'Knowledge Base', path: '/support/knowledge-base' },
    ]},
  ]},
  { section: 'OPERATIONS', sectionKey: 'assets', items: [
    { label: 'Assets', path: '/assets', icon: <Monitor size={16} /> },
  ]},
  { section: 'COMPANY', sectionKey: 'announcements', items: [
    { label: 'Announcements', path: '/announcements', icon: <Bell size={16} /> },
  ]},
  { section: 'COMPANY', sectionKey: 'documents', items: [
    { label: 'Documents', path: '/documents', icon: <FileText size={16} /> },
  ]},
  { section: 'ADMIN', sectionKey: 'settings', items: [{ label: 'Settings', path: '/settings', icon: <Settings size={16} /> }] },
];

interface NavGroupProps { item: NavItem; }

const NavGroup: React.FC<NavGroupProps> = ({ item }) => {
  const location = useLocation();
  const isChildActive = item.children?.some(c => c.path && location.pathname === c.path);
  const [open, setOpen] = useState(isChildActive || false);

  if (item.path) {
    return (
      <NavLink to={item.path} className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
      }>
        {item.icon}<span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isChildActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        <span className="flex items-center gap-2.5">{item.icon}<span>{item.label}</span></span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-3 border-l border-slate-700 flex flex-col gap-0.5">
          {item.children?.map(child => (
            <NavLink key={child.path} to={child.path!} className={({ isActive }) =>
              `block px-2 py-1.5 rounded-md text-xs transition-all ${isActive ? 'text-white bg-slate-700' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`
            }>{child.label}</NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { logout, currentUser, canAccess } = useAuth();

  return (
    <div className="w-56 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">OrgOS</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        {navItems.filter(({ sectionKey }) => canAccess(sectionKey)).map(({ section, sectionKey, items }) => (
          <div key={sectionKey} className="mb-5">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">{section}</p>
            <div className="flex flex-col gap-0.5">
              {items.map(item => <NavGroup key={item.label} item={item} />)}
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser?.role}</p>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-slate-300 transition-colors" title="Logout">
            <Users size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
