import { useState } from 'react';
import { getAttendance, saveAttendance, getEmployees } from '../../store/storage';
import { AttendanceRecord } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { Plus, Trash2 } from 'lucide-react';

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>(getAttendance());
  const employees = getEmployees();
  const [filterEmp, setFilterEmp] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', employeeName: '', date: new Date().toISOString().split('T')[0], status: 'Present' as AttendanceRecord['status'] });

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    const newRec: AttendanceRecord = { id: crypto.randomUUID(), ...form, employeeName: emp?.name || form.employeeName };
    const updated = [...records, newRec];
    saveAttendance(updated); setRecords(updated); setShowModal(false);
    setForm({ employeeId: '', employeeName: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
  };

  const del = (id: string) => { const u = records.filter(r => r.id !== id); saveAttendance(u); setRecords(u); };

  const filtered = records.filter(r => (filterEmp === 'all' || r.employeeId === filterEmp) && (!filterDate || r.date.startsWith(filterDate)));

  const empName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
  const uniqueEmps = [...new Set(filtered.map(r => r.employeeId))];

  const stats = (empId: string) => {
    const empRecs = filtered.filter(r => r.employeeId === empId);
    return { total: empRecs.length, present: empRecs.filter(r => r.status === 'Present').length, absent: empRecs.filter(r => r.status === 'Absent').length, half: empRecs.filter(r => r.status === 'Half Day').length };
  };

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Track employee attendance records" action={<Button onClick={() => setShowModal(true)}><Plus size={16} className="mr-1" />Log Attendance</Button>} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input type="month" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {uniqueEmps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center"><p className="text-slate-400">No attendance records for this period</p></div>
      ) : (
        <div className="space-y-6">
          {uniqueEmps.map(empId => {
            const s = stats(empId);
            const empRecs = filtered.filter(r => r.employeeId === empId).sort((a, b) => b.date.localeCompare(a.date));
            return (
              <div key={empId} className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">{empName(empId).charAt(0)}</div>
                    <p className="font-semibold text-slate-900">{empName(empId)}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-emerald-600 font-medium">{s.present} Present</span>
                    <span className="text-red-500 font-medium">{s.absent} Absent</span>
                    <span className="text-amber-500 font-medium">{s.half} Half Day</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50"><th className="text-left px-4 py-2 font-medium text-slate-600">Date</th><th className="text-left px-4 py-2 font-medium text-slate-600">Status</th><th className="px-4 py-2"></th></tr></thead>
                    <tbody>{empRecs.map(r => (
                      <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-700">{r.date}</td>
                        <td className="px-4 py-2"><Badge status={r.status} /></td>
                        <td className="px-4 py-2"><button onClick={() => del(r.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Attendance">
        <div className="space-y-3">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={employees.map(e => ({ value: e.id, label: e.name }))} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AttendanceRecord['status'] }))} options={['Present','Absent','Half Day','WFH','Leave'].map(v => ({ value: v, label: v }))} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
