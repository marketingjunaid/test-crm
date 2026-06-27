import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { EmptyState } from '../../components/UI/EmptyState';
import { getEmployees, saveEmployees, getDepartments } from '../../store/storage';
import type { Employee } from '../../types';

const empty: Omit<Employee,'id'|'createdAt'> = { name:'',email:'',phone:'',role:'',department:'',salary:0,joinDate:'',status:'Active',contractType:'Full-time',managerId:'' };

export default function Employees() {
  const [employees, setEmployees] = useState(getEmployees());
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee|null>(null);
  const [form, setForm] = useState<Omit<Employee,'id'|'createdAt'>>(empty);
  const depts = ['All', ...getDepartments().map(d=>d.name)];

  const save = () => {
    const updated = editing ? employees.map(e=>e.id===editing.id?{...editing,...form}:e) : [...employees,{...form,id:crypto.randomUUID(),createdAt:new Date().toISOString().split('T')[0]}];
    saveEmployees(updated); setEmployees(updated); setModal(false); setEditing(null); setForm(empty);
  };
  const del = (id:string) => { if(!confirm('Delete employee?'))return; const u=employees.filter(e=>e.id!==id); saveEmployees(u); setEmployees(u); };
  const openEdit = (e:Employee) => { setEditing(e); setForm({name:e.name,email:e.email,phone:e.phone,role:e.role,department:e.department,salary:e.salary,joinDate:e.joinDate,status:e.status,contractType:e.contractType,managerId:e.managerId||''}); setModal(true); };
  const filtered = employees.filter(e=>(deptFilter==='All'||e.department===deptFilter)&&(e.name.toLowerCase().includes(search.toLowerCase())||e.role.toLowerCase().includes(search.toLowerCase())));
  const fmt = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${employees.filter(e=>e.status==='Active').length} active employees`} action={<Button onClick={()=>{setEditing(null);setForm(empty);setModal(true);}}><Plus size={15}/>Add Employee</Button>} />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex gap-1 flex-wrap">
            {depts.map(d=><button key={d} onClick={()=>setDeptFilter(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${deptFilter===d?'bg-indigo-50 text-indigo-700':'text-slate-500 hover:text-slate-700'}`}>{d}</button>)}
          </div>
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/></div>
        </div>
        {filtered.length===0?<EmptyState message="No employees found"/>:(
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{['Employee','Department','Role','Reports To','Salary','Contract','Status','Joined',''].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{filtered.map(e=>{
              const manager = e.managerId ? employees.find(m=>m.id===e.managerId) : null;
              return (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{e.name[0]}</div><div><p className="text-sm font-medium text-slate-900">{e.name}</p><p className="text-xs text-slate-400">{e.email}</p></div></div></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{e.department}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{e.role}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{manager ? <span className="flex items-center gap-1"><span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{manager.name[0]}</span>{manager.name}</span> : <span className="text-slate-400 text-xs">Direct to HR</span>}</td>
                <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{fmt(e.salary)}</td>
                <td className="px-5 py-3.5"><Badge label={e.contractType}/></td>
                <td className="px-5 py-3.5"><Badge label={e.status}/></td>
                <td className="px-5 py-3.5 text-xs text-slate-400">{e.joinDate}</td>
                <td className="px-5 py-3.5"><div className="flex gap-1">
                  <button onClick={()=>openEdit(e)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"><Pencil size={14}/></button>
                  <button onClick={()=>del(e.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                </div></td>
              </tr>
            )})}</tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal} onClose={()=>setModal(false)} title={editing?'Edit Employee':'Add Employee'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <Input label="Job Title / Role" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} />
          <Input label="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />
          <Input label="Annual Salary ($)" type="number" value={form.salary} onChange={e=>setForm({...form,salary:Number(e.target.value)})} />
          <Input label="Join Date" type="date" value={form.joinDate} onChange={e=>setForm({...form,joinDate:e.target.value})} />
          <Select label="Contract Type" value={form.contractType} onChange={e=>setForm({...form,contractType:e.target.value as Employee['contractType']})} options={['Full-time','Part-time','Contract'].map(v=>({value:v,label:v}))} />
          <Select label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value as Employee['status']})} options={['Active','Inactive'].map(v=>({value:v,label:v}))} />
          <Select label="Reports To (Manager / Team Lead)" value={form.managerId||''} onChange={e=>setForm({...form,managerId:e.target.value})} options={[{value:'',label:'— Direct to HR (no manager) —'},...employees.filter(m=>m.id!==(editing?.id)).map(m=>({value:m.id,label:`${m.name} — ${m.role}`}))]} />
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing?'Update':'Add'} Employee</Button>
        </div>
      </Modal>
    </div>
  );
}
