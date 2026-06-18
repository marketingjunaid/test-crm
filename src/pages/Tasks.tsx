import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI/Modal';
import { Badge, taskPriorityVariant, taskStatusVariant } from '../components/UI/Badge';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import type { Task } from '../types';

type Priority = Task['priority'];
type Status = Task['status'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
const STATUSES: Status[] = ['Open', 'In Progress', 'Done'];

const empty: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', description: '', dueDate: '', priority: 'Medium', status: 'Open', assignedTo: 'Demo User', relatedTo: '',
};

export function Tasks() {
  const { data, addTask, updateTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState<Status | 'All'>('All');

  const tasks = filter === 'All' ? data.tasks : data.tasks.filter(t => t.status === filter);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (t: Task) => {
    setForm({ title: t.title, description: t.description, dueDate: t.dueDate, priority: t.priority, status: t.status, assignedTo: t.assignedTo, relatedTo: t.relatedTo });
    setEditing(t); setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    editing ? updateTask(editing.id, form) : addTask(form);
    setShowModal(false);
  };

  const toggleDone = (t: Task) => {
    updateTask(t.id, { status: t.status === 'Done' ? 'Open' : 'Done' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.tasks.filter(t => t.status !== 'Done').length} open tasks</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="flex gap-2">
        {(['All', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['', 'Title', 'Due Date', 'Priority', 'Status', 'Related To', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasks.map(t => (
              <tr key={t.id} className={`hover:bg-gray-50 ${t.status === 'Done' ? 'opacity-60' : ''}`}>
                <td className="pl-4 py-3">
                  <button onClick={() => toggleDone(t)} className={`${t.status === 'Done' ? 'text-green-500' : 'text-gray-300 hover:text-green-400'} transition-colors`}>
                    <CheckCircle size={18} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className={`font-medium text-gray-900 ${t.status === 'Done' ? 'line-through' : ''}`}>{t.title}</div>
                  {t.description && <div className="text-xs text-gray-400 mt-0.5">{t.description}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{t.dueDate}</td>
                <td className="px-4 py-3"><Badge label={t.priority} variant={taskPriorityVariant(t.priority)} /></td>
                <td className="px-4 py-3"><Badge label={t.status} variant={taskStatusVariant(t.status)} /></td>
                <td className="px-4 py-3 text-gray-600">{t.relatedTo}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteTask(t.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No tasks found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Task' : 'Add Task'} onClose={() => setShowModal(false)} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related To</label>
                <input value={form.relatedTo} onChange={e => setForm(f => ({ ...f, relatedTo: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
