import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, X } from 'lucide-react';
import type { OnboardingTask } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const DEFAULT_TASKS = [
  'Setup company email',
  'Issue laptop and equipment',
  'Sign NDA',
  'Complete HR orientation',
  'Meet the team',
  'Set up payroll',
  'Review company policies',
  'Complete security training',
];

export function Onboarding() {
  const [tasks, setTasks] = useState<OnboardingTask[]>(() => loadHRData().onboardingTasks);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', task: '', dueDate: '' });
  const [customTask, setCustomTask] = useState('');

  const employees = loadHRData().employees;

  const grouped = employees.map(emp => ({
    emp,
    tasks: tasks.filter(t => t.employeeId === emp.id),
  })).filter(g => g.tasks.length > 0);

  const toggle = (id: string) => {
    const data = loadHRData();
    data.onboardingTasks = data.onboardingTasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? now() : undefined } : t
    );
    saveHRData(data);
    setTasks(data.onboardingTasks);
  };

  const del = (id: string) => {
    const data = loadHRData();
    data.onboardingTasks = data.onboardingTasks.filter(t => t.id !== id);
    saveHRData(data);
    setTasks(data.onboardingTasks);
  };

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    const taskName = form.task === '__custom__' ? customTask : form.task;
    if (!taskName || !emp) return;
    const data = loadHRData();
    const task: OnboardingTask = { id: generateId(), employeeId: form.employeeId, employeeName: emp.name, task: taskName, completed: false, dueDate: form.dueDate };
    data.onboardingTasks = [...data.onboardingTasks, task];
    saveHRData(data);
    setTasks(data.onboardingTasks);
    setShowModal(false);
    setForm({ employeeId: '', task: '', dueDate: '' });
    setCustomTask('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Onboarding</h2>
          <p className="text-sm text-gray-500">{tasks.filter(t => !t.completed).length} pending tasks</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="space-y-6">
        {grouped.map(({ emp, tasks: empTasks }) => {
          const done = empTasks.filter(t => t.completed).length;
          const pct = Math.round((done / empTasks.length) * 100);
          return (
            <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{emp.name}</h3>
                  <p className="text-xs text-gray-500">{emp.role} · {emp.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{pct}%</p>
                  <p className="text-xs text-gray-400">{done}/{empTasks.length} complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="space-y-2">
                {empTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 group">
                    <button onClick={() => toggle(t.id)} className="flex-shrink-0">
                      {t.completed
                        ? <CheckCircle2 size={18} className="text-green-500" />
                        : <Circle size={18} className="text-gray-300 hover:text-blue-400" />}
                    </button>
                    <span className={`flex-1 text-sm ${t.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.task}</span>
                    {t.dueDate && <span className="text-xs text-gray-400">Due {t.dueDate}</span>}
                    <button onClick={() => del(t.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {grouped.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No onboarding tasks yet.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Add Onboarding Task</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Task</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.task} onChange={e => setForm({ ...form, task: e.target.value })}>
                  <option value="">Select task...</option>
                  {DEFAULT_TASKS.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="__custom__">Custom task...</option>
                </select>
              </div>
              {form.task === '__custom__' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custom Task</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={customTask} onChange={e => setCustomTask(e.target.value)} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
