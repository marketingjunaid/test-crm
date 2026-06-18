import { useState } from 'react';
import { Users, Briefcase, FileText, ClipboardList, Mail, Calendar } from 'lucide-react';
import { Employees } from './Employees';
import { Hiring } from './Hiring';
import { Documents } from './Documents';
import { Onboarding } from './Onboarding';
import { OfferLetters } from './OfferLetters';
import { LeaveManagement } from './LeaveManagement';

const TABS = [
  { id: 'employees', label: 'Employees', icon: Users, component: Employees },
  { id: 'hiring', label: 'Hiring', icon: Briefcase, component: Hiring },
  { id: 'documents', label: 'Documents', icon: FileText, component: Documents },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardList, component: Onboarding },
  { id: 'offer-letters', label: 'Offer Letters', icon: Mail, component: OfferLetters },
  { id: 'leaves', label: 'Leaves', icon: Calendar, component: LeaveManagement },
] as const;

type TabId = typeof TABS[number]['id'];

export function HR() {
  const [activeTab, setActiveTab] = useState<TabId>('employees');
  const ActiveComponent = TABS.find(t => t.id === activeTab)!.component;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employees, hiring, documents, and more</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <ActiveComponent />
    </div>
  );
}
