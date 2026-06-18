import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import type { Employee } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Operations'];

const emptyForm = (): Omit<Employee, 'id' | 'createdAt'> => ({
  name: '', email: '', phone: '', role: '', department: 'Engineering',
  joinDate: '', status: 'Active', salary: 0,
});

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadHRData().employees);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm());

  const save = () => {
    const data = loadHRData();
    if (editing) {
      const updated = data.employees.map(e => e.id === editing.id ? { ...editing, ...form } : e);
      data.employees = updated;
      setEmployees(updated);
    } else {
      const emp: Employee = { id: generateId(), ...form, createdAt: now() };
      data.employees = [emp, ...data.employees];
      setEmployees(data.employees);
    }
    saveHRData(data);
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const del = (id: string) => {
    const data = loadHRData();
    data.employees = data.employees.filter(e => e.id !== id);
    saveHRData(data);
    setEmployees(data.employees);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, role: emp.role, department: emp.department, joinDate: emp.joinDate, status: emp.status, salary: emp.salary });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Employees</h2>
          <p className="text-sm text-gray-500">{employees.filter(e => e.status === 'Active').length} active employees</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm()); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Role', 'Department', 'Email', 'Join Date', 'Salary', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                <td className="px-4 py-3 text-gray-600">{emp.joinDate}</td>
                <td className="px-4 py-3 text-gray-600">${emp.salary.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{emp.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(emp)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                    <button onClick={() => del(emp.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">{editing ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {(['name', 'email', 'phone', 'role'] as const).map(f => (
                <div key={f}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Join Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Salary ($)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Employee['status'] })}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
