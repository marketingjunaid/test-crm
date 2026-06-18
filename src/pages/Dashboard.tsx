import { useApp } from '../contexts/AppContext';
import { Users, UserCheck, Building2, TrendingUp, CheckSquare, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { data } = useApp();

  const stats = [
    { label: 'Leads', value: data.leads.length, icon: UserCheck, color: 'bg-purple-100 text-purple-600' },
    { label: 'Contacts', value: data.contacts.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Companies', value: data.companies.length, icon: Building2, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Deals', value: data.deals.length, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Tasks', value: data.tasks.filter(t => t.status !== 'Done').length, icon: CheckSquare, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Notes', value: data.notes.length, icon: FileText, color: 'bg-red-100 text-red-600' },
  ];

  const totalDealValue = data.deals.reduce((s, d) => s + d.value, 0);
  const wonDeals = data.deals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);

  const stageData = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(stage => ({
    stage: stage.length > 12 ? stage.slice(0, 12) + '…' : stage,
    count: data.deals.filter(d => d.stage === stage).length,
    value: data.deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0),
  }));

  const recentLeads = [...data.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const openTasks = data.tasks.filter(t => t.status !== 'Done').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">${totalDealValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Closed Won Value</div>
          <div className="text-2xl font-bold text-green-600 mt-1">${wonValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Win Rate</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {data.deals.length > 0 ? Math.round((wonDeals.length / data.deals.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Deals by Stage</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stageData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Leads</h2>
          <div className="space-y-3">
            {recentLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{lead.name}</div>
                  <div className="text-xs text-gray-500">{lead.company}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                  lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>{lead.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Open Tasks</h2>
          <div className="space-y-3">
            {openTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{task.title}</div>
                  <div className="text-xs text-gray-500">Due: {task.dueDate}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{task.priority}</span>
              </div>
            ))}
            {openTasks.length === 0 && <p className="text-sm text-gray-400">No open tasks</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
