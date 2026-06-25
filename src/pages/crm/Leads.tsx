import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { getLeads, saveLeads } from '../../store/storage';
import type { Lead } from '../../types';

const empty: Omit<Lead,'id'|'createdAt'> = { name:'', email:'', phone:'', company:'', source:'Website', status:'New', priority:'Medium', assignedTo:'', notes:'' };

export default function Leads() {
  const [leads, setLeads] = useState(getLeads());
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Omit<Lead,'id'|'createdAt'>>(empty);

  const save = () => {
    const updated = editing
      ? leads.map(l => l.id === editing.id ? { ...editing, ...form } : l)
      : [...leads, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }];
    saveLeads(updated); setLeads(updated); setModal(false); setEditing(null); setForm(empty);
  };

  const del = (id: string) => {
    if (!confirm('Delete this lead?')) return;
    const updated = leads.filter(l => l.id !== id);
    saveLeads(updated); setLeads(updated);
  };

  const openEdit = (l: Lead) => { setEditing(l); setForm({ name:l.name, email:l.email, phone:l.phone, company:l.company, source:l.source, status:l.status, priority:l.priority, assignedTo:l.assignedTo, notes:l.notes }); setModal(true); };

  const filtered = leads.filter(l => (filter === 'All' || l.status === filter) && (l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase())));
  const tabs = ['All', 'New', 'Contacted', 'Qualified', 'Lost'];

  return (
    <div>
      <PageHeader title="Leads" subtitle="Track and manage your sales leads" action={<Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}><Plus size={15} />Add Lead</Button>} />
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex gap-1">
            {tabs.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===t ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>)}
          </div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" /></div>
        </div>
        {filtered.length === 0 ? <EmptyState message="No leads found" action={<Button size="sm" onClick={() => setModal(true)}><Plus size={13}/>Add Lead</Button>} /> : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{['Name','Company','Source','Status','Priority','Assigned To','Date',''].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-900">{l.name}</p><p className="text-xs text-slate-400">{l.email}</p></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{l.company}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{l.source}</td>
                  <td className="px-5 py-3.5"><Badge label={l.status} /></td>
                  <td className="px-5 py-3.5"><Badge label={l.priority} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{l.assignedTo}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{l.createdAt}</td>
                  <td className="px-5 py-3.5"><div className="flex gap-1">
                    <button onClick={()=>openEdit(l)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={14}/></button>
                    <button onClick={()=>del(l.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={()=>{setModal(false);setEditing(null);}} title={editing?'Edit Lead':'Add Lead'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Input label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <Select label="Source" value={form.source} onChange={e=>setForm({...form,source:e.target.value})} options={['Website','Referral','LinkedIn','Cold Email','Trade Show','Other'].map(v=>({value:v,label:v}))} />
          <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value as Lead['status']})} options={['New','Contacted','Qualified','Lost'].map(v=>({value:v,label:v}))} />
          <Select label="Priority" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Lead['priority']})} options={['Low','Medium','High'].map(v=>({value:v,label:v}))} />
          <Input label="Assigned To" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} />
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>{setModal(false);setEditing(null);}}>Cancel</Button>
          <Button onClick={save}>{editing?'Update':'Add'} Lead</Button>
        </div>
      </Modal>
    </div>
  );
}
