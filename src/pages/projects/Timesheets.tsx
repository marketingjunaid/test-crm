import { useState } from 'react';
import { getTimesheets, saveTimesheets, getProjects, getEmployees } from '../../store/storage';
import { Timesheet } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { Plus, Trash2, Clock } from 'lucide-react';

export default function Timesheets() {
  const [sheets, setSheets] = useState<Timesheet[]>(getTimesheets());
  const projects = getProjects();
  const employees = getEmployees();
  const [filterMonth, setFilterMonth] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', projectId: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true });

  const save = () => {
    const newSheet: Timesheet = {
      id: crypto.randomUUID(),
      employeeId: form.employeeId,
      employeeName: employees.find(e => e.id === form.employeeId)?.name || '',
      projectId: form.projectId,
      projectName: projects.find(p => p.id === form.projectId)?.name || '',
      date: form.date,
      hours: parseFloat(form.hours) || 0,
      description: form.description,
      billable: form.billable,
    };
    const updated = [...sheets, newSheet];
    saveTimesheets(updated); setSheets(updated); setShowModal(false);
    setForm({ employeeId: '', projectId: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true });
  };

  const del = (id: string) => { const u = sheets.filter(s => s.id !== id); saveTimesheets(u); setSheets(u); };

  const filtered = filterMonth ? sheets.filter(s => s.date.startsWith(filterMonth)) : sheets;
  const totalHours = filtered.reduce((sum, s) => sum + s.hours, 0);
  const billableHours = filtered.filter(s => s.billable).reduce((sum, s) => sum + s.hours, 0);

  return (
    <div>
      <PageHeader title="Timesheets" subtitle="Track time spent on projects" action={<Button onClick={() => setShowModal(true)}><Plus size={16} className="mr-1" />Log Time</Button>} />

      <div className="flex items-center gap-4 mb-6">
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-4">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-2"><Clock size={16} className="text-indigo-600" /><span className="text-sm text-slate-500">Total:</span><span className="font-semibold">{totalHours}h</span></div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 flex items-center gap-2"><Clock size={16} className="text-emerald-600" /><span className="text-sm text-slate-500">Billable:</span><span className="font-semibold">{billableHours}h</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Employee</th><th className="text-left px-5 py-3 font-medium text-slate-600">Project</th><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Hours</th><th className="text-left px-5 py-3 font-medium text-slate-600">Description</th><th className="text-left px-5 py-3 font-medium text-slate-600">Billable</th><th className="px-5 py-3"></th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No timesheet entries</td></tr> : filtered.sort((a,b) => b.date.localeCompare(a.date)).map(s => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{s.employeeName}</td>
                <td className="px-5 py-3 text-slate-600">{s.projectName}</td>
                <td className="px-5 py-3 text-slate-500">{s.date}</td>
                <td className="px-5 py-3 font-semibold text-indigo-600">{s.hours}h</td>
                <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{s.description}</td>
                <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${s.billable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.billable ? 'Yes' : 'No'}</span></td>
                <td className="px-5 py-3">
                  <button onClick={() => del(s.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Time">
        <div className="space-y-3">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={employees.map(e => ({ value: e.id, label: e.name }))} />
          <Select label="Project" value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} options={projects.map(p => ({ value: p.id, label: p.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <Input label="Hours" type="number" step="0.5" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.billable} onChange={e => setForm(p => ({ ...p, billable: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
            Billable
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
