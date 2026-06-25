import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { EmptyState } from '../../components/UI/EmptyState';
import { getLeaves, saveLeaves, getEmployees, getCompany } from '../../store/storage';
import type { LeaveApplication } from '../../types';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState(getLeaves());
  const [modal, setModal] = useState(false);
  const employees = getEmployees();
  const { annualLeaves } = getCompany();
  const [form, setForm] = useState({ employeeId:'', type:'Annual' as LeaveApplication['type'], fromDate:'', toDate:'', reason:'' });

  const calcDays = (from:string,to:string) => {
    if(!from||!to) return 0;
    const diff = new Date(to).getTime()-new Date(from).getTime();
    return Math.max(1, Math.floor(diff/(1000*60*60*24))+1);
  };

  const save = () => {
    const emp = employees.find(e=>e.id===form.employeeId);
    if(!emp) return;
    const days = calcDays(form.fromDate, form.toDate);
    const newLeave: LeaveApplication = { id:crypto.randomUUID(), employeeId:form.employeeId, employeeName:emp.name, type:form.type, fromDate:form.fromDate, toDate:form.toDate, days, reason:form.reason, status:'Pending', appliedAt:new Date().toISOString().split('T')[0] };
    const updated = [...leaves, newLeave];
    saveLeaves(updated); setLeaves(updated); setModal(false); setForm({employeeId:'',type:'Annual',fromDate:'',toDate:'',reason:''});
  };

  const updateStatus = (id:string, status: LeaveApplication['status']) => {
    const updated = leaves.map(l=>l.id===id?{...l,status}:l);
    saveLeaves(updated); setLeaves(updated);
  };

  const getUsed = (empId:string) => leaves.filter(l=>l.employeeId===empId&&l.status==='Approved').reduce((s,l)=>s+l.days,0);

  return (
    <div>
      <PageHeader title="Leave Management" subtitle={`${annualLeaves} leaves per year per employee`} action={<Button onClick={()=>setModal(true)}><Plus size={15}/>Apply Leave</Button>} />

      {/* Employee leave summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {employees.filter(e=>e.status==='Active').map(emp=>{
          const used = getUsed(emp.id);
          const remaining = annualLeaves - used;
          const pct = Math.min(100, (used/annualLeaves)*100);
          return (
            <div key={emp.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{emp.name[0]}</div>
                <div><p className="text-xs font-medium text-slate-900 leading-tight">{emp.name}</p><p className="text-[10px] text-slate-400">{emp.department}</p></div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full mb-2"><div className="h-1.5 bg-indigo-500 rounded-full transition-all" style={{width:`${pct}%`}}/></div>
              <div className="flex justify-between text-xs text-slate-500">
                <span><span className="font-semibold text-slate-700">{used}</span> used</span>
                <span><span className="font-semibold text-emerald-600">{remaining}</span> left</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave applications */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="text-sm font-semibold text-slate-900">All Leave Applications</h2></div>
        {leaves.length===0?<EmptyState message="No leave applications"/>:(
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{['Employee','Type','From','To','Days','Reason','Status',''].map(h=><th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{leaves.map(l=>(
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{l.employeeName}</td>
                <td className="px-5 py-3.5"><Badge label={l.type}/></td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{l.fromDate}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600">{l.toDate}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{l.days}</td>
                <td className="px-5 py-3.5 text-sm text-slate-600 max-w-xs truncate">{l.reason}</td>
                <td className="px-5 py-3.5"><Badge label={l.status}/></td>
                <td className="px-5 py-3.5">{l.status==='Pending'&&(
                  <div className="flex gap-1">
                    <button onClick={()=>updateStatus(l.id,'Approved')} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"><Check size={13}/></button>
                    <button onClick={()=>updateStatus(l.id,'Rejected')} className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"><X size={13}/></button>
                  </div>
                )}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={()=>setModal(false)} title="Apply for Leave">
        <div className="flex flex-col gap-4">
          <Select label="Employee" value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} options={[{value:'',label:'Select employee'},...employees.map(e=>({value:e.id,label:e.name}))]} />
          <Select label="Leave Type" value={form.type} onChange={e=>setForm({...form,type:e.target.value as LeaveApplication['type']})} options={['Annual','Sick','Emergency','Unpaid'].map(v=>({value:v,label:v}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="From Date" type="date" value={form.fromDate} onChange={e=>setForm({...form,fromDate:e.target.value})} />
            <Input label="To Date" type="date" value={form.toDate} onChange={e=>setForm({...form,toDate:e.target.value})} />
          </div>
          {form.fromDate&&form.toDate&&<p className="text-xs text-indigo-600 font-medium">{calcDays(form.fromDate,form.toDate)} day(s)</p>}
          <Textarea label="Reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Reason for leave..." />
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.employeeId||!form.fromDate||!form.toDate}>Submit Application</Button>
        </div>
      </Modal>
    </div>
  );
}
