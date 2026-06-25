import { useState } from 'react';
import { getProjects, saveProjects } from '../../store/storage';
import { Project } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, Users, Calendar } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', client: '', startDate: '', endDate: '', budget: '', status: 'Planning' as Project['status'], health: 'On Track' as Project['health'], team: '' });

  const openModal = (p?: Project) => {
    if (p) { setEditProj(p); setForm({ name: p.name, description: p.description, client: p.client || '', startDate: p.startDate, endDate: p.endDate, budget: String(p.budget || 0), status: p.status, health: p.health, team: p.team.join(', ') }); }
    else { setEditProj(null); setForm({ name: '', description: '', client: '', startDate: '', endDate: '', budget: '', status: 'Planning', health: 'On Track', team: '' }); }
    setShowModal(true);
  };

  const save = () => {
    const team = form.team.split(',').map(s => s.trim()).filter(Boolean);
    let updated: Project[];
    if (editProj) { updated = projects.map(p => p.id === editProj.id ? { ...p, ...form, budget: parseFloat(form.budget) || 0, team } : p); }
    else { updated = [...projects, { id: crypto.randomUUID(), ...form, budget: parseFloat(form.budget) || 0, team, createdAt: new Date().toISOString().split('T')[0] }]; }
    saveProjects(updated); setProjects(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = projects.filter(p => p.id !== id); saveProjects(u); setProjects(u); };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
  const statuses: Project['status'][] = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];

  const statusBg: Record<string, string> = { Planning: 'bg-slate-50', Active: 'bg-emerald-50', 'On Hold': 'bg-amber-50/50', Completed: 'bg-indigo-50', Cancelled: 'bg-red-50/50' };

  return (
    <div>
      <PageHeader title="Projects" subtitle="Manage and track all projects" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Project</Button>} />

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>All</button>
        {statuses.map(s => <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{s}</button>)}
      </div>

      {filtered.length === 0 ? <EmptyState message="No projects found" action={<Button onClick={() => openModal()}>Create Project</Button>} /> : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`${statusBg[p.status] || 'bg-white'} rounded-xl border border-slate-200 shadow-sm p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-slate-900">{p.name}</h3><Badge status={p.status} /><Badge status={p.health} /></div>
                  <p className="text-sm text-slate-500">{p.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => del(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                {p.client && <div><p className="text-slate-400 text-xs">Client</p><p className="font-medium text-slate-700">{p.client}</p></div>}
                <div className="flex items-center gap-1 col-span-2"><Calendar size={12} className="text-slate-400" /><div><p className="text-slate-400 text-xs">Timeline</p><p className="font-medium text-slate-700 text-xs">{p.startDate} → {p.endDate}</p></div></div>
                {p.budget > 0 && <div><p className="text-slate-400 text-xs">Budget</p><p className="font-medium text-slate-700">${p.budget.toLocaleString()}</p></div>}
                {p.team.length > 0 && <div className="flex items-center gap-1 text-slate-500"><Users size={13} /><span className="text-xs">{p.team.length} members</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProj ? 'Edit Project' : 'New Project'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Project Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="col-span-2"><Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
          <Input label="Client (optional)" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
          <Input label="Budget ($)" type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Project['status'] }))} options={statuses.map(v => ({ value: v, label: v }))} />
          <Select label="Health" value={form.health} onChange={e => setForm(p => ({ ...p, health: e.target.value as Project['health'] }))} options={['On Track','At Risk','Delayed'].map(v => ({ value: v, label: v }))} />
          <div className="col-span-2"><Input label="Team Members (comma-separated)" value={form.team} onChange={e => setForm(p => ({ ...p, team: e.target.value }))} placeholder="John, Jane, Bob" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
