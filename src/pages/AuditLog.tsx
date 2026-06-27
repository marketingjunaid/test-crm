import { useState } from 'react';
import { getAuditLog } from '../store/storage';
import PageHeader from '../components/UI/PageHeader';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import { downloadCSV } from '../utils/export';
import Button from '../components/UI/Button';
import { Download } from 'lucide-react';

const ACTION_META = {
  create: { label: 'Create', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <Plus size={12} /> },
  update: { label: 'Update', bg: 'bg-blue-50', text: 'text-blue-700', icon: <Edit2 size={12} /> },
  delete: { label: 'Delete', bg: 'bg-red-50', text: 'text-red-700', icon: <Trash2 size={12} /> },
};

const MODULES = ['All', 'CRM', 'HR', 'Finance', 'Projects', 'Inventory', 'Support', 'Assets', 'Settings'];

export default function AuditLogPage() {
  const logs = getAuditLog();
  const [filterModule, setFilterModule] = useState('All');
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l => {
    if (filterModule !== 'All' && l.module !== filterModule) return false;
    if (filterAction !== 'all' && l.action !== filterAction) return false;
    if (search && !l.description.toLowerCase().includes(search.toLowerCase()) && !l.userName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fmtTime = (ts: string) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Track all create, update, and delete actions across the system"
        action={
          <Button variant="secondary" onClick={() => {
            const hdrs = ['Timestamp', 'User', 'Action', 'Module', 'Description'];
            const rows = filtered.map(l => [fmtTime(l.timestamp), l.userName, l.action, l.module, l.description]);
            downloadCSV('audit-log.csv', hdrs, rows);
          }}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by user or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No audit log entries yet</p>
            <p className="text-slate-400 text-xs mt-1">Actions will appear here as users create, edit, and delete records</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">User</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Action</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Module</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => {
                const m = ACTION_META[l.action];
                return (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{fmtTime(l.timestamp)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{l.userName}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
                        {m.icon}{m.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{l.module}</td>
                    <td className="px-5 py-3 text-slate-700">{l.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-3">{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}</p>
      )}
    </div>
  );
}
