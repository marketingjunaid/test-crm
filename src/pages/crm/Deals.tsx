import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { getDeals, saveDeals } from '../../store/storage';
import type { Deal } from '../../types';

const STAGES: Deal['stage'][] = ['Prospect','Qualified','Proposal','Negotiation','Won','Lost'];
const stageColors: Record<string,string> = { Prospect:'bg-slate-100',Qualified:'bg-blue-50',Proposal:'bg-violet-50',Negotiation:'bg-amber-50',Won:'bg-emerald-50',Lost:'bg-rose-50' };
const stageText: Record<string,string> = { Prospect:'text-slate-600',Qualified:'text-blue-700',Proposal:'text-violet-700',Negotiation:'text-amber-700',Won:'text-emerald-700',Lost:'text-rose-700' };
const fmt = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

const empty: Omit<Deal,'id'|'createdAt'> = { title:'',company:'',contact:'',value:0,stage:'Prospect',probability:20,expectedClose:'',assignedTo:'',notes:'' };

export default function Deals() {
  const [deals, setDeals] = useState(getDeals());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Deal|null>(null);
  const [form, setForm] = useState<Omit<Deal,'id'|'createdAt'>>(empty);

  const save = () => {
    const updated = editing ? deals.map(d=>d.id===editing.id?{...editing,...form}:d) : [...deals,{...form,id:crypto.randomUUID(),createdAt:new Date().toISOString().split('T')[0]}];
    saveDeals(updated); setDeals(updated); setModal(false); setEditing(null); setForm(empty);
  };
  const del = (id:string) => { if(!confirm('Delete deal?'))return; const u=deals.filter(d=>d.id!==id); saveDeals(u); setDeals(u); };
  const openEdit = (d:Deal) => { setEditing(d); setForm({title:d.title,company:d.company,contact:d.contact,value:d.value,stage:d.stage,probability:d.probability,expectedClose:d.expectedClose,assignedTo:d.assignedTo,notes:d.notes}); setModal(true); };

  return (
    <div>
      <PageHeader title="Deals Pipeline" subtitle="Track your deals across stages" action={<Button onClick={()=>{setEditing(null);setForm(empty);setModal(true);}}><Plus size={15}/>Add Deal</Button>} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageDe = deals.filter(d=>d.stage===stage);
          const total = stageDe.reduce((s,d)=>s+d.value,0);
          return (
            <div key={stage} className="flex-shrink-0 w-60">
              <div className={`rounded-xl px-3 py-2 mb-3 ${stageColors[stage]}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${stageText[stage]}`}>{stage}</span>
                  <span className={`text-xs font-medium ${stageText[stage]}`}>{stageDe.length}</span>
                </div>
                <p className={`text-xs mt-0.5 ${stageText[stage]} opacity-75`}>{fmt(total)}</p>
              </div>
              <div className="flex flex-col gap-2">
                {stageDe.map(d=>(
                  <div key={d.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 leading-tight flex-1">{d.title}</p>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button onClick={()=>openEdit(d)} className="p-1 hover:bg-indigo-50 rounded text-slate-400 hover:text-indigo-600"><Pencil size={12}/></button>
                        <button onClick={()=>del(d.id)} className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{d.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{fmt(d.value)}</span>
                      <span className="text-xs text-slate-400">{d.probability}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Close: {d.expectedClose}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modal} onClose={()=>setModal(false)} title={editing?'Edit Deal':'Add Deal'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Deal Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
          <Input label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <Input label="Contact Name" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
          <Input label="Deal Value ($)" type="number" value={form.value} onChange={e=>setForm({...form,value:Number(e.target.value)})} />
          <Select label="Stage" value={form.stage} onChange={e=>setForm({...form,stage:e.target.value as Deal['stage']})} options={STAGES.map(v=>({value:v,label:v}))} />
          <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={e=>setForm({...form,probability:Number(e.target.value)})} />
          <Input label="Expected Close" type="date" value={form.expectedClose} onChange={e=>setForm({...form,expectedClose:e.target.value})} />
          <Input label="Assigned To" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} />
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing?'Update':'Add'} Deal</Button>
        </div>
      </Modal>
    </div>
  );
}
