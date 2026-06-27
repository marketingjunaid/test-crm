import { useState } from 'react';
import { getTasks, saveTasks, getProjects } from '../../store/storage';
import { Task } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { Plus, Trash2, Edit2, CheckSquare, Square, AlertCircle, Link } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const projects = getProjects();
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    projectId: '', title: '', description: '', assignedTo: '',
    dueDate: '', priority: 'Medium' as Task['priority'],
    status: 'To Do' as Task['status'], dependsOn: [] as string[],
  });

  const openModal = (t?: Task) => {
    if (t) {
      setEditTask(t);
      setForm({ projectId: t.projectId || '', title: t.title, description: t.description || '', assignedTo: t.assignedTo, dueDate: t.dueDate, priority: t.priority, status: t.status, dependsOn: t.dependsOn || [] });
    } else {
      setEditTask(null);
      setForm({ projectId: '', title: '', description: '', assignedTo: '', dueDate: '', priority: 'Medium', status: 'To Do', dependsOn: [] });
    }
    setShowModal(true);
  };

  const save = () => {
    let updated: Task[];
    if (editTask) {
      updated = tasks.map(t => t.id === editTask.id ? { ...t, ...form } : t);
    } else {
      updated = [...tasks, { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString().split('T')[0] }];
    }
    saveTasks(updated); setTasks(updated); setShowModal(false);
  };

  const del = (id: string) => {
    const u = tasks.filter(t => t.id !== id).map(t => ({ ...t, dependsOn: t.dependsOn?.filter(d => d !== id) }));
    saveTasks(u); setTasks(u);
  };

  const toggleStatus = (t: Task) => {
    const cycle: Task['status'][] = ['To Do', 'In Progress', 'Review', 'Done'];
    const idx = cycle.indexOf(t.status);
    const newStatus = cycle[(idx + 1) % cycle.length];
    const updated = tasks.map(task => task.id === t.id ? { ...task, status: newStatus } : task);
    saveTasks(updated); setTasks(updated);
  };

  const toggleDependency = (taskId: string) => {
    setForm(p => ({
      ...p,
      dependsOn: p.dependsOn.includes(taskId)
        ? p.dependsOn.filter(id => id !== taskId)
        : [...p.dependsOn, taskId],
    }));
  };

  const isBlocked = (t: Task) => {
    if (!t.dependsOn?.length) return false;
    return t.dependsOn.some(depId => {
      const dep = tasks.find(x => x.id === depId);
      return dep && dep.status !== 'Done';
    });
  };

  const getBlockedBy = (t: Task) => {
    if (!t.dependsOn?.length) return [];
    return t.dependsOn
      .map(depId => tasks.find(x => x.id === depId))
      .filter(dep => dep && dep.status !== 'Done') as Task[];
  };

  const filtered = tasks.filter(t =>
    (filterProject === 'all' || t.projectId === filterProject) &&
    (filterStatus === 'all' || t.status === filterStatus)
  );
  const projName = (id?: string) => projects.find(p => p.id === id)?.name || 'No Project';

  const statuses: Task['status'][] = ['To Do', 'In Progress', 'Review', 'Done'];
  const grouped: Record<string, Task[]> = {};
  filtered.forEach(t => { if (!grouped[t.status]) grouped[t.status] = []; grouped[t.status].push(t); });

  // Available tasks for dependency selection (exclude editing task and its own deps)
  const availableDeps = tasks.filter(t => !editTask || t.id !== editTask.id);

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Track and manage project tasks" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Task</Button>} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-6">
        {statuses.map(status => {
          const statusTasks = grouped[status] || [];
          if (statusTasks.length === 0 && filterStatus === 'all') return null;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-slate-700">{status}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{statusTasks.length}</span>
              </div>
              <div className="space-y-2">
                {statusTasks.map(t => {
                  const blocked = isBlocked(t);
                  const blockedBy = getBlockedBy(t);
                  return (
                    <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-3 hover:border-indigo-200 ${blocked ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                      <button onClick={() => !blocked && toggleStatus(t)} className={`mt-0.5 ${blocked ? 'text-amber-400 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}`} title={blocked ? 'Blocked by dependencies' : undefined}>
                        {t.status === 'Done' ? <CheckSquare size={17} className="text-emerald-500" /> : blocked ? <AlertCircle size={17} /> : <Square size={17} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-medium text-sm ${t.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{t.title}</p>
                          <Badge status={t.priority} />
                          {blocked && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><AlertCircle size={10} />Blocked</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-slate-400 flex-wrap">
                          <span>Project: {projName(t.projectId)}</span>
                          <span>Assignee: {t.assignedTo}</span>
                          {t.dueDate && <span>Due: {t.dueDate}</span>}
                          {t.dependsOn && t.dependsOn.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Link size={10} />
                              Depends on: {t.dependsOn.map(id => tasks.find(x => x.id === id)?.title || 'Unknown').join(', ')}
                            </span>
                          )}
                        </div>
                        {blocked && blockedBy.length > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            Waiting for: {blockedBy.map(b => b.title).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openModal(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                        <button onClick={() => del(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center"><p className="text-slate-400">No tasks found</p></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <div className="space-y-3">
          <Select label="Project" value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))} options={projects.map(p => ({ value: p.id, label: p.name }))} />
          <Input label="Task Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Assigned To" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Task['priority'] }))} options={['Low','Medium','High','Urgent'].map(v => ({ value: v, label: v }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Task['status'] }))} options={statuses.map(v => ({ value: v, label: v }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />

          {availableDeps.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Depends On (blocked until these are done)</label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {availableDeps.map(dep => (
                  <label key={dep.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.dependsOn.includes(dep.id)}
                      onChange={() => toggleDependency(dep.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${dep.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-700'}`}>{dep.title}</span>
                    <Badge status={dep.status} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
