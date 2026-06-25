import { useState } from 'react';
import { Plus, CheckCircle, XCircle, X, Calendar } from 'lucide-react';
import type { LeaveApplication } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const TOTAL_LEAVES = 22;

const STATUS_COLORS: Record<LeaveApplication['status'], string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export function LeaveManagement() {
  const [applications, setApplications] = useState<LeaveApplication[]>(() => loadHRData().leaveApplications);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', fromDate: '', toDate: '', reason: '' });

  const employees = loadHRData().employees;

  const usedLeaves = (empId: string) =>
    applications.filter(a => a.employeeId === empId && a.status === 'Approved').reduce((s, a) => s + a.days, 0);

  const calcDays = (from: string, to: string) => {
    if (!from || !to) return 0;
    const diff = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    if (!emp) return;
    const days = calcDays(form.fromDate, form.toDate);
    const app: LeaveApplication = { id: generateId(), employeeId: form.employeeId, employeeName: emp.name, fromDate: form.fromDate, toDate: form.toDate, days, reason: form.reason, status: 'Pending', appliedAt: now() };
    const data = loadHRData();
    data.leaveApplications = [app, ...data.leaveApplications];
    saveHRData(data);
    setApplications(data.leaveApplications);
    setShowModal(false);
    setForm({ employeeId: '', fromDate: '', toDate: '', reason: '' });
  };

  const updateStatus = (id: string, status: LeaveApplication['status']) => {
    const data = loadHRData();
    data.leaveApplications = data.leaveApplications.map(a => a.id === id ? { ...a, status } : a);
    saveHRData(data);
    setApplications(data.leaveApplications);
  };

  return (
    <div className="space-y-6">
      {/* Leave Summary */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Balance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.filter(e => e.status === 'Active').map(emp => {
            const used = usedLeaves(emp.id);
            const remaining = TOTAL_LEAVES - used;
            const pct = Math.round((used / TOTAL_LEAVES) * 100);
            return (
              <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.department}</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Calendar size={14} />
                    <span className="text-xs font-semibold">{remaining} left</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className={`h-1.5 rounded-full ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{used} used</span>
                  <span>{TOTAL_LEAVES} total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applications */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Leave Applications</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Employee', 'From', 'To', 'Days', 'Reason', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.employeeName}</td>
                  <td className="px-4 py-3 text-gray-600">{a.fromDate}</td>
                  <td className="px-4 py-3 text-gray-600">{a.toDate}</td>
                  <td className="px-4 py-3 text-gray-600">{a.days}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{a.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === 'Pending' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => updateStatus(a.id, 'Approved')} className="p-1 text-gray-400 hover:text-green-600" title="Approve"><CheckCircle size={16} /></button>
                        <button onClick={() => updateStatus(a.id, 'Rejected')} className="p-1 text-gray-400 hover:text-red-600" title="Reject"><XCircle size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No leave applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Apply for Leave</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                  <option value="">Select employee...</option>
                  {employees.map(e => {
                    const used = usedLeaves(e.id);
                    return <option key={e.id} value={e.id}>{e.name} ({TOTAL_LEAVES - used} days remaining)</option>;
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} />
                </div>
              </div>
              {form.fromDate && form.toDate && (
                <p className="text-sm text-blue-600 font-medium">{calcDays(form.fromDate, form.toDate)} day(s) selected</p>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!form.employeeId || !form.fromDate || !form.toDate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
