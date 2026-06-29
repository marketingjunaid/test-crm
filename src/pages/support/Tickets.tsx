import { useState } from 'react';
import { getTickets, saveTickets } from '../../store/storage';
import { fireTrigger } from '../../utils/automationEngine';
import { Ticket } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, MessageSquare } from 'lucide-react';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ subject: '', description: '', submittedBy: '', priority: 'Medium' as Ticket['priority'], status: 'Open' as Ticket['status'], category: 'Technical', assignedTo: '', notes: '' });

  const openModal = (t?: Ticket) => {
    if (t) { setEditTicket(t); setForm({ subject: t.subject, description: t.description, submittedBy: t.submittedBy, priority: t.priority, status: t.status, category: t.category, assignedTo: t.assignedTo || '', notes: t.notes || '' }); }
    else { setEditTicket(null); setForm({ subject: '', description: '', submittedBy: '', priority: 'Medium', status: 'Open', category: 'Technical', assignedTo: '', notes: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: Ticket[];
    if (editTicket) {
      updated = tickets.map(t => t.id === editTicket.id ? { ...t, ...form } : t);
    } else {
      const newT: Ticket = { id: crypto.randomUUID(), ticketNumber: `TKT-${String(tickets.length + 1).padStart(4, '0')}`, ...form, createdAt: new Date().toISOString().split('T')[0] };
      updated = [...tickets, newT];
      fireTrigger('ticket_created', { name: form.subject, ticketId: newT.id });
    }
    saveTickets(updated); setTickets(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = tickets.filter(t => t.id !== id); saveTickets(u); setTickets(u); };
  const close = (id: string) => {
    const u = tickets.map(t => t.id === id ? { ...t, status: 'Closed' as Ticket['status'] } : t);
    saveTickets(u); setTickets(u);
  };

  const filtered = tickets.filter(t => (filter === 'all' || t.status === filter) && (t.subject.toLowerCase().includes(search.toLowerCase()) || t.submittedBy.toLowerCase().includes(search.toLowerCase())));

  const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const sorted = [...filtered].sort((a, b) => (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));

  const counts = { Open: tickets.filter(t => t.status === 'Open').length, 'In Progress': tickets.filter(t => t.status === 'In Progress').length, Resolved: tickets.filter(t => t.status === 'Resolved').length, Closed: tickets.filter(t => t.status === 'Closed').length };

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Manage customer support requests" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Ticket</Button>} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center cursor-pointer hover:border-indigo-300" onClick={() => setFilter(k)}>
            <p className="text-2xl font-bold text-slate-900">{v}</p><p className="text-sm text-slate-500">{k}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-2">
          {['all','Open','In Progress','Resolved','Closed'].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{s === 'all' ? 'All' : s}</button>)}
        </div>
      </div>

      {sorted.length === 0 ? <EmptyState message="No tickets found" action={<Button onClick={() => openModal()}>Create Ticket</Button>} /> : (
        <div className="space-y-3">
          {sorted.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{t.ticketNumber}</span>
                    <Badge status={t.priority} /><Badge status={t.status} /><Badge status={t.category} />
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">{t.subject}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">{t.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MessageSquare size={11} />Submitted by: {t.submittedBy}</span>
                    {t.assignedTo && <span>Assigned: {t.assignedTo}</span>}
                    <span>Created: {t.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {t.status !== 'Closed' && <button onClick={() => close(t.id)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Close</button>}
                  <button onClick={() => openModal(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => del(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTicket ? 'Edit Ticket' : 'New Support Ticket'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
          <Input label="Submitted By" value={form.submittedBy} onChange={e => setForm(p => ({ ...p, submittedBy: e.target.value }))} />
          <Input label="Assigned To" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={['Technical','Billing','General','Feature Request','Bug'].map(v => ({ value: v, label: v }))} />
          <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Ticket['priority'] }))} options={['Low','Medium','High','Urgent'].map(v => ({ value: v, label: v }))} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Ticket['status'] }))} options={['Open','In Progress','On Hold','Resolved','Closed'].map(v => ({ value: v, label: v }))} />
          <div className="col-span-2"><Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
