import { useState } from 'react';
import { getOnboarding, saveOnboarding, getEmployees } from '../../store/storage';
import { OnboardingTask } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function Onboarding() {
  const [tasks, setTasks] = useState<OnboardingTask[]>(getOnboarding());
  const employees = getEmployees();
  const [filterEmp, setFilterEmp] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', task: '', dueDate: '' });

  const openModal = () => { setForm({ employeeId: '', task: '', dueDate: '' }); setShowModal(true); };

  const save = () => {
    const newTask: OnboardingTask = { id: crypto.randomUUID(), employeeId: form.employeeId, task: form.task, completed: false, dueDate: form.dueDate };
    const updated = [...tasks, newTask];
    saveOnboarding(updated); setTasks(updated); setShowModal(false);
  };

  const toggle = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString().split('T')[0] : undefined } : t);
    saveOnboarding(updated); setTasks(updated);
  };

  const del = (id: string) => { const u = tasks.filter(t => t.id !== id); saveOnboarding(u); setTasks(u); };

  const filtered = filterEmp === 'all' ? tasks : tasks.filter(t => t.employeeId === filterEmp);
  const grouped: Record<string, OnboardingTask[]> = {};
  filtered.forEach(t => { if (!grouped[t.employeeId]) grouped[t.employeeId] = []; grouped[t.employeeId].push(t); });

  return (
    <div>
      <PageHeader title="Onboarding" subtitle="Track new employee onboarding tasks" action={<Button onClick={openModal}><Plus size={16} className="mr-1" />Add Task</Button>} />
      <div className="mb-6 flex gap-3 flex-wrap">
        <button onClick={() => setFilterEmp('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterEmp === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>All Employees</button>
        {employees.map(e => (
          <button key={e.id} onClick={() => setFilterEmp(e.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterEmp === e.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{e.name}</button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center"><p className="text-slate-400">No onboarding tasks found</p></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([empId, empTasks]) => {
            const emp = employees.find(e => e.id === empId);
            const completed = empTasks.filter(t => t.completed).length;
            const pct = Math.round((completed / empTasks.length) * 100);
            return (
              <div key={empId} className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">{emp?.name.charAt(0) || '?'}</div>
                      <div><p className="font-semibold text-slate-900">{emp?.name || 'Unknown'}</p><p className="text-xs text-slate-500">{emp?.role}</p></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{completed}/{empTasks.length} tasks · {pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="divide-y divide-slate-50">
                  {empTasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                      <button onClick={() => toggle(task.id)} className="text-slate-400 hover:text-indigo-600">
                        {task.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.task}</p>
                        {task.dueDate && <p className="text-xs text-slate-400 mt-0.5">Due: {task.dueDate}</p>}
                        {task.completedAt && <p className="text-xs text-emerald-500 mt-0.5">Completed: {task.completedAt}</p>}
                      </div>
                      <button onClick={() => del(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Onboarding Task">
        <div className="space-y-3">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={employees.map(e => ({ value: e.id, label: e.name }))} />
          <Input label="Task" value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} placeholder="e.g. Complete IT setup" />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
