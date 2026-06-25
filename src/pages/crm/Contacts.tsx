import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { getContacts, saveContacts } from '../../store/storage';
import type { Contact } from '../../types';

const empty: Omit<Contact,'id'|'createdAt'> = { name:'', email:'', phone:'', company:'', title:'', notes:'' };

export default function Contacts() {
  const [contacts, setContacts] = useState(getContacts());
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact,'id'|'createdAt'>>(empty);

  const save = () => {
    const updated = editing ? contacts.map(c => c.id === editing.id ? { ...editing, ...form } : c) : [...contacts, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }];
    saveContacts(updated); setContacts(updated); setModal(false); setEditing(null); setForm(empty);
  };
  const del = (id: string) => { if (!confirm('Delete?')) return; const u = contacts.filter(c => c.id !== id); saveContacts(u); setContacts(u); };
  const openEdit = (c: Contact) => { setEditing(c); setForm({ name:c.name, email:c.email, phone:c.phone, company:c.company, title:c.title, notes:c.notes }); setModal(true); };
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Contacts" subtitle="Manage your business contacts" action={<Button onClick={()=>{setEditing(null);setForm(empty);setModal(true);}}><Plus size={15}/>Add Contact</Button>} />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-end px-5 py-4 border-b border-slate-100">
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/></div>
        </div>
        {filtered.length===0?<EmptyState message="No contacts found"/>:(
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{['Name','Email','Phone','Company','Title','Date',''].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{filtered.map(c=>(
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{c.name[0]}</div><span className="text-sm font-medium text-slate-900">{c.name}</span></div></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.email}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.phone}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.company}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.title}</td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{c.createdAt}</td>
                <td className="px-5 py-3.5"><div className="flex gap-1">
                  <button onClick={()=>openEdit(c)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={14}/></button>
                  <button onClick={()=>del(c.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal} onClose={()=>{setModal(false);setEditing(null);}} title={editing?'Edit Contact':'Add Contact'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Input label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <Input label="Job Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing?'Update':'Add'} Contact</Button>
        </div>
      </Modal>
    </div>
  );
}
