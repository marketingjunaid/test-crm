import { useState } from 'react';
import { getPayroll, savePayroll, getEmployees } from '../../store/storage';
import { PayrollRecord } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { Plus, DollarSign, Trash2, Edit2, Download, FileText } from 'lucide-react';
import { downloadCSV, printTable } from '../../utils/export';

export default function Payroll() {
  const [records, setRecords] = useState<PayrollRecord[]>(getPayroll());
  const employees = getEmployees();
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState<PayrollRecord | null>(null);
  const [form, setForm] = useState({ employeeId: '', month: new Date().toISOString().slice(0, 7), year: new Date().getFullYear(), basicSalary: '', allowances: '', deductions: '', status: 'Draft' as PayrollRecord['status'] });

  const openModal = (rec?: PayrollRecord) => {
    if (rec) { setEditRec(rec); setForm({ employeeId: rec.employeeId, month: rec.month, year: rec.year, basicSalary: String(rec.basicSalary), allowances: String(rec.allowances), deductions: String(rec.deductions), status: rec.status }); }
    else { setEditRec(null); setForm({ employeeId: '', month: filterMonth, year: new Date().getFullYear(), basicSalary: '', allowances: '0', deductions: '0', status: 'Draft' }); }
    setShowModal(true);
  };

  const save = () => {
    const basicSalary = parseFloat(form.basicSalary) || 0;
    const allowances = parseFloat(form.allowances) || 0;
    const deductions = parseFloat(form.deductions) || 0;
    const netSalary = basicSalary + allowances - deductions;
    const empName = employees.find(e => e.id === form.employeeId)?.name || '';
    let updated: PayrollRecord[];
    if (editRec) { updated = records.map(r => r.id === editRec.id ? { ...r, ...form, employeeName: empName, basicSalary, allowances, deductions, netSalary } : r); }
    else { updated = [...records, { id: crypto.randomUUID(), employeeId: form.employeeId, employeeName: empName, month: form.month, year: form.year, basicSalary, allowances, deductions, netSalary, status: form.status }]; }
    savePayroll(updated); setRecords(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = records.filter(r => r.id !== id); savePayroll(u); setRecords(u); };
  const markPaid = (id: string) => { const u = records.map(r => r.id === id ? { ...r, status: 'Paid' as PayrollRecord['status'] } : r); savePayroll(u); setRecords(u); };

  const filtered = records.filter(r => r.month === filterMonth);
  const totalNet = filtered.reduce((s, r) => s + r.netSalary, 0);

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Manage employee salaries and payments" action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            const hdrs = ['Employee','Month','Basic','Allowances','Deductions','Net Salary','Status'];
            const rows = filtered.map(r => [r.employeeName, r.month, r.basicSalary, r.allowances, r.deductions, r.netSalary, r.status]);
            downloadCSV(`payroll-${filterMonth}.csv`, hdrs, rows);
          }}><Download size={14} /> CSV</Button>
          <Button variant="secondary" onClick={() => {
            const hdrs = ['Employee','Month','Basic','Allowances','Deductions','Net Salary','Status'];
            const rows = filtered.map(r => [r.employeeName, r.month, `$${r.basicSalary.toLocaleString()}`, `$${r.allowances.toLocaleString()}`, `$${r.deductions.toLocaleString()}`, `$${r.netSalary.toLocaleString()}`, r.status]);
            printTable(`Payroll Report — ${filterMonth}`, hdrs, rows);
          }}><FileText size={14} /> PDF</Button>
          <Button onClick={() => openModal()}><Plus size={16} />Add Record</Button>
        </div>
      } />

      <div className="flex items-center gap-4 mb-6">
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-2">
          <DollarSign size={16} className="text-indigo-600" />
          <span className="text-sm text-slate-500">Total Payroll:</span>
          <span className="font-semibold text-slate-900">${totalNet.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Employee</th><th className="text-left px-5 py-3 font-medium text-slate-600">Basic</th><th className="text-left px-5 py-3 font-medium text-slate-600">Allowances</th><th className="text-left px-5 py-3 font-medium text-slate-600">Deductions</th><th className="text-left px-5 py-3 font-medium text-slate-600">Net</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No payroll records for this month</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{r.employeeName}</td>
                <td className="px-5 py-3 text-slate-600">${r.basicSalary.toLocaleString()}</td>
                <td className="px-5 py-3 text-emerald-600">+${r.allowances.toLocaleString()}</td>
                <td className="px-5 py-3 text-red-500">-${r.deductions.toLocaleString()}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">${r.netSalary.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge status={r.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    {r.status !== 'Paid' && <button onClick={() => markPaid(r.id)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Mark Paid</button>}
                    <button onClick={() => openModal(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editRec ? 'Edit Payroll' : 'Add Payroll Record'}>
        <div className="space-y-3">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={employees.map(e => ({ value: e.id, label: e.name }))} />
          <Input label="Month" type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Basic Salary ($)" type="number" value={form.basicSalary} onChange={e => setForm(p => ({ ...p, basicSalary: e.target.value }))} />
            <Input label="Allowances ($)" type="number" value={form.allowances} onChange={e => setForm(p => ({ ...p, allowances: e.target.value }))} />
            <Input label="Deductions ($)" type="number" value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} />
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as PayrollRecord['status'] }))} options={['Draft','Processed','Paid'].map(v => ({ value: v, label: v }))} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
