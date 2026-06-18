import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Building2,
  TrendingUp, CheckSquare, FileText, Settings, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: UserCheck, label: 'Leads' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/deals', icon: TrendingUp, label: 'Deals' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-blue-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 rounded-lg p-1.5">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CRM Pro</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-blue-800 text-xs text-blue-400">
        CRM Pro v1.0
      </div>
    </aside>
  );
}
