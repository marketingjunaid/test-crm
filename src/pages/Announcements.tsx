import { useState } from 'react';
import { getAnnouncements, saveAnnouncements } from '../store/storage';
import { Announcement } from '../types';
import PageHeader from '../components/UI/PageHeader';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Textarea from '../components/UI/Textarea';
import { Plus, Trash2, Edit2, Megaphone, Pin } from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', content: '', department: 'All', priority: 'Normal' as Announcement['priority'], pinned: false, createdBy: '' });

  const openModal = (a?: Announcement) => {
    if (a) { setEditAnn(a); setForm({ title: a.title, content: a.content, department: a.department, priority: a.priority, pinned: a.pinned, createdBy: a.createdBy }); }
    else { setEditAnn(null); setForm({ title: '', content: '', department: 'All', priority: 'Normal', pinned: false, createdBy: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: Announcement[];
    if (editAnn) {
      updated = announcements.map(a => a.id === editAnn.id ? { ...a, ...form } : a);
    } else {
      const newAnn: Announcement = { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString().split('T')[0] };
      updated = [...announcements, newAnn];
    }
    saveAnnouncements(updated); setAnnouncements(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = announcements.filter(a => a.id !== id); saveAnnouncements(u); setAnnouncements(u); };
  const togglePin = (id: string) => { const u = announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a); saveAnnouncements(u); setAnnouncements(u); };

  const filtered = filter === 'all' ? announcements : announcements.filter(a => a.department === filter || a.priority === filter);
  const sorted = [...filtered].sort((a, b) => { if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; return b.createdAt.localeCompare(a.createdAt); });

  const priorityBorder: Record<string, string> = { Urgent: 'border-l-4 border-red-500', Important: 'border-l-4 border-amber-400', Normal: 'border-l-4 border-slate-200' };

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Company-wide announcements and notices" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Announcement</Button>} />

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','All','HR','IT','Finance','Engineering','Sales'].map(c => <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{c === 'all' ? 'All Departments' : c}</button>)}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center"><Megaphone size={40} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-400">No announcements yet</p></div>
      ) : (
        <div className="space-y-4">
          {sorted.map(a => (
            <div key={a.id} className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${priorityBorder[a.priority] || ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.pinned && <Pin size={14} className="text-indigo-500" />}
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <Badge status={a.department} /><Badge status={a.priority} />
                  </div>
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">{a.content}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>By {a.createdBy}</span>
                    <span>{a.createdAt}</span>
                    <span>Department: {a.department}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => togglePin(a.id)} className={`p-1.5 rounded ${a.pinned ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}><Pin size={14} /></button>
                  <button onClick={() => openModal(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => del(a.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editAnn ? 'Edit Announcement' : 'New Announcement'} size="lg">
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} options={['All','HR','IT','Finance','Engineering','Sales','Management'].map(v => ({ value: v, label: v }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Announcement['priority'] }))} options={['Normal','Important','Urgent'].map(v => ({ value: v, label: v }))} />
          </div>
          <Input label="Created By" value={form.createdBy} onChange={e => setForm(p => ({ ...p, createdBy: e.target.value }))} />
          <Textarea label="Content" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5} />
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"><input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />Pin this announcement</label>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Publish</Button></div>
      </Modal>
    </div>
  );
}
