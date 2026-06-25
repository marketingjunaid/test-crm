import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { getCRMCompanies, saveCRMCompanies } from '../../store/storage';
import type { CRMCompany } from '../../types';

const empty: Omit<CRMCompany,'id'|'createdAt'> = { name:'', industry:'Technology', website:'', phone:'', email:'', size:'1-10', notes:'' };

export default function CRMCompanies() {
  const [companies, setCompanies] = useState(getCRMCompanies());
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CRMCompany | null>(null);
  const [form, setForm] = useState<Omit<CRMCompany,'id'|'createdAt'>>(empty);

  const save = () => {
    const updated = editing ? companies.map(c => c.id===editing.id?{...editing,...form}:c) : [...companies,{...form,id:crypto.randomUUID(),createdAt:new Date().toISOString().split('T')[0]}];
    saveCRMCompanies(updated); setCompanies(updated); setModal(false); setEditing(null); setForm(empty);
  };
  const del = (id:string) => { if(!confirm('Delete?'))return; const u=companies.filter(c=>c.id!==id); saveCRMCompanies(u); setCompanies(u); };
  const openEdit = (c:CRMCompany) => { setEditing(c); setForm({name:c.name,industry:c.industry,website:c.website,phone:c.phone,email:c.email,size:c.size,notes:c.notes}); setModal(true); };
  const filtered = companies.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Companies" subtitle="Manage your business accounts" action={<Button onClick={()=>{setEditing(null);setForm(empty);setModal(true);}}><Plus size={15}/>Add Company</Button>} />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-end px-5 py-4 border-b border-slate-100">
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/></div>
        </div>
        {filtered.length===0?<EmptyState message="No companies found"/>:(
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{['Name','Industry','Size','Phone','Email','Date',''].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{filtered.map(c=>(
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-400">{c.website}</p></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.industry}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.size}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.phone}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{c.email}</td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{c.createdAt}</td>
                <td className="px-5 py-3.5"><div className="flex gap-1">
                  <button onClick={()=>openEdit(c)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"><Pencil size={14}/></button>
                  <button onClick={()=>del(c.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal} onClose={()=>setModal(false)} title={editing?'Edit Company':'Add Company'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <Select label="Industry" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} options={['Technology','Finance','Healthcare','Retail','Manufacturing','Education','Design','Other'].map(v=>({value:v,label:v}))} />
          <Input label="Website" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
          <Select label="Company Size" value={form.size} onChange={e=>setForm({...form,size:e.target.value})} options={['1-10','11-50','51-200','201-500','500+'].map(v=>({value:v,label:v}))} />
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing?'Update':'Add'} Company</Button>
        </div>
      </Modal>
    </div>
  );
}
