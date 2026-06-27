import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { getLeaves, saveLeaves, getEmployees, getCompany } from '../../store/storage';
import { useAuth } from '../../contexts/AuthContext';
import type { LeaveApplication } from '../../types';

const STATUS_TABS = ['All', 'Pending Manager', 'Pending HR', 'Approved', 'Rejected'] as const;

export default function LeaveManagement() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState(getLeaves());
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('All');
  const [modal, setModal] = useState(false);
  const employees = getEmployees();
  const { annualLeaves } = getCompany();
  const [form, setForm] = useState({ employeeId: '', type: 'Annual' as LeaveApplication['type'], fromDate: '', toDate: '', reason: '' });

  const isHR = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';

  // Find the logged-in user's Employee record to identify their direct reports
  const myEmployeeRecord = employees.find(e => e.name === currentUser?.name);
  const myDirectReports = myEmployeeRecord ? employees.filter(e => e.managerId === myEmployeeRecord.id) : [];
  const myDirectReportIds = new Set(myDirectReports.map(e => e.id));

  const calcDays = (from: string, to: string) => {
    if (!from || !to) return 0;
    return Math.max(1, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);
  };

  const getManagerName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp?.managerId) return null;
    return employees.find(m => m.id === emp.managerId)?.name ?? null;
  };

  // Filter leaves visible to the current role
  const visibleLeaves = leaves.filter(l => {
    if (isHR) return true;
    if (isManager) {
      // Managers see leaves from their direct reports only
      const emp = employees.find(e => e.id === l.employeeId || e.name === l.employeeName);
      return emp ? myDirectReportIds.has(emp.id) : false;
    }
    return false;
  });

  const filtered = tab === 'All' ? visibleLeaves : visibleLeaves.filter(l => l.status === tab);

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    if (!emp) return;
    const days = calcDays(form.fromDate, form.toDate);
    // HR applying on behalf — goes straight to Pending HR
    const newLeave: LeaveApplication = {
      id: crypto.randomUUID(), employeeId: form.employeeId, employeeName: emp.name,
      type: form.type, fromDate: form.fromDate, toDate: form.toDate, days,
      reason: form.reason, status: emp.managerId ? 'Pending Manager' : 'Pending HR',
      appliedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...leaves, newLeave];
    saveLeaves(updated); setLeaves(updated); setModal(false);
    setForm({ employeeId: '', type: 'Annual', fromDate: '', toDate: '', reason: '' });
  };

  const updateStatus = (id: string, newStatus: LeaveApplication['status']) => {
    const updated = leaves.map(l => l.id === id ? { ...l, status: newStatus } : l);
    saveLeaves(updated); setLeaves(updated);
  };

  // Manager approves → moves to Pending HR; Manager rejects → Rejected
  // HR approves → Approved; HR rejects → Rejected
  const handleApprove = (l: LeaveApplication) => {
    if (isManager) updateStatus(l.id, 'Pending HR');
    else updateStatus(l.id, 'Approved');
  };
  const handleReject = (l: LeaveApplication) => updateStatus(l.id, 'Rejected');

  const canAct = (l: LeaveApplication) => {
    if (isManager) return l.status === 'Pending Manager';
    if (isHR) return l.status === 'Pending HR';
    return false;
  };

  const getUsed = (empId: string) => leaves.filter(l => l.employeeId === empId && l.status === 'Approved').reduce((s, l) => s + l.days, 0);

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle={`${annualLeaves} leaves per year · ${isManager ? `Managing ${myDirectReports.length} direct report(s)` : 'HR view — all employees'}`}
        action={isHR ? <Button onClick={() => setModal(true)}><Plus size={15} />Apply Leave</Button> : undefined}
      />

      {/* Direct reports summary for managers */}
      {isManager && myDirectReports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {myDirectReports.filter(e => e.status === 'Active').map(emp => {
            const used = getUsed(emp.id);
            const remaining = annualLeaves - used;
            const pct = Math.min(100, (used / annualLeaves) * 100);
            return (
              <div key={emp.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{emp.name[0]}</div>
                  <div><p className="text-xs font-medium text-slate-900 leading-tight">{emp.name}</p><p className="text-[10px] text-slate-400">{emp.role}</p></div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mb-2"><div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span><span className="font-semibold text-slate-700">{used}</span> used</span>
                  <span><span className="font-semibold text-emerald-600">{remaining}</span> left</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All employees summary for HR */}
      {isHR && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {employees.filter(e => e.status === 'Active').map(emp => {
            const used = getUsed(emp.id);
            const remaining = annualLeaves - used;
            const pct = Math.min(100, (used / annualLeaves) * 100);
            const manager = emp.managerId ? employees.find(m => m.id === emp.managerId) : null;
            return (
              <div key={emp.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{emp.name[0]}</div>
                  <div><p className="text-xs font-medium text-slate-900 leading-tight">{emp.name}</p><p className="text-[10px] text-slate-400">{emp.department}</p></div>
                </div>
                {manager && <p className="text-[10px] text-slate-400 mb-2 pl-10">Reports to: {manager.name}</p>}
                {!manager && <p className="text-[10px] text-indigo-400 mb-2 pl-10">Direct to HR</p>}
                <div className="h-1.5 bg-slate-100 rounded-full mb-2"><div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span><span className="font-semibold text-slate-700">{used}</span> used</span>
                  <span><span className="font-semibold text-emerald-600">{remaining}</span> left</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leave applications table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex gap-1 flex-wrap">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
              {t !== 'All' && <span className="ml-1 text-[10px] opacity-70">({visibleLeaves.filter(l => l.status === t).length})</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? <EmptyState message="No leave applications" /> : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              {['Employee', 'Reports To', 'Type', 'From', 'To', 'Days', 'Reason', 'Status', ''].map(h =>
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              )}
            </tr></thead>
            <tbody>{filtered.map(l => {
              const mgr = getManagerName(l.employeeId);
              return (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{l.employeeName}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{mgr ?? <span className="text-indigo-500">Direct to HR</span>}</td>
                  <td className="px-4 py-3"><Badge label={l.type} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{l.fromDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{l.toDate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{l.days}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3"><Badge label={l.status} /></td>
                  <td className="px-4 py-3">
                    {canAct(l) && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(l)} title={isManager ? 'Forward to HR' : 'Approve'}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"><Check size={13} /></button>
                        <button onClick={() => handleReject(l)} title="Reject"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"><X size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Apply Leave on Behalf of Employee">
        <div className="flex flex-col gap-4">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
            options={[{ value: '', label: 'Select employee' }, ...employees.map(e => ({ value: e.id, label: e.name }))]} />
          <Select label="Leave Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as LeaveApplication['type'] })}
            options={['Annual', 'Sick', 'Emergency', 'Unpaid'].map(v => ({ value: v, label: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="From Date" type="date" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} />
            <Input label="To Date" type="date" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} />
          </div>
          {form.fromDate && form.toDate && <p className="text-xs text-indigo-600 font-medium">{calcDays(form.fromDate, form.toDate)} day(s)</p>}
          <Textarea label="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." />
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.employeeId || !form.fromDate || !form.toDate}>Submit Application</Button>
        </div>
      </Modal>
    </div>
  );
}
