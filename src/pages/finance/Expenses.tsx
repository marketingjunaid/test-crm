import { useState } from 'react';
import { getExpenses, saveExpenses } from '../../store/storage';
import { Expense } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(getExpenses());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editExp, setEditExp] = useState<Expense | null>(null);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Operations', date: new Date().toISOString().split('T')[0], submittedBy: '', status: 'Pending' as Expense['status'], description: '' });

  const categories = ['Operations', 'Travel', 'Marketing', 'Software', 'Hardware', 'Office', 'Training', 'Other'];

  const openModal = (exp?: Expense) => {
    if (exp) { setEditExp(exp); setForm({ title: exp.title, amount: String(exp.amount), category: exp.category, date: exp.date, submittedBy: exp.submittedBy, status: exp.status, description: exp.description || '' }); }
    else { setEditExp(null); setForm({ title: '', amount: '', category: 'Operations', date: new Date().toISOString().split('T')[0], submittedBy: '', status: 'Pending' as Expense['status'], description: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: Expense[];
    if (editExp) { updated = expenses.map(e => e.id === editExp.id ? { ...e, ...form, amount: parseFloat(form.amount) || 0 } : e); }
    else { updated = [...expenses, { id: crypto.randomUUID(), ...form as any, amount: parseFloat(form.amount) || 0, paidBy: form.submittedBy, createdAt: new Date().toISOString().split('T')[0] }]; }
    saveExpenses(updated); setExpenses(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = expenses.filter(e => e.id !== id); saveExpenses(u); setExpenses(u); };
  const approve = (id: string) => { const u = expenses.map(e => e.id === id ? { ...e, status: 'Approved' as Expense['status'] } : e); saveExpenses(u); setExpenses(u); };
  const reject = (id: string) => { const u = expenses.map(e => e.id === id ? { ...e, status: 'Rejected' as Expense['status'] } : e); saveExpenses(u); setExpenses(u); };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.status === filter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track and manage business expenses" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Add Expense</Button>} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', 'Pending', 'Approved', 'Rejected'].map(t => <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{t === 'all' ? 'All' : t}</button>)}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm"><span className="text-slate-500">Total: </span><span className="font-semibold text-slate-900">${total.toLocaleString()}</span></div>
      </div>

      {filtered.length === 0 ? <EmptyState message="No expenses found" action={<Button onClick={() => openModal()}>Add Expense</Button>} /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Title</th><th className="text-left px-5 py-3 font-medium text-slate-600">Category</th><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Submitted By</th><th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{filtered.map(exp => (
              <tr key={exp.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{exp.title}</td>
                <td className="px-5 py-3"><Badge status={exp.category} /></td>
                <td className="px-5 py-3 text-slate-500">{exp.date}</td>
                <td className="px-5 py-3 text-slate-500">{exp.submittedBy}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">${exp.amount.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge status={exp.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    {exp.status === 'Pending' && <><button onClick={() => approve(exp.id)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Approve</button><button onClick={() => reject(exp.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Reject</button></>}
                    <button onClick={() => openModal(exp)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(exp.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editExp ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount ($)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} options={categories.map(v => ({ value: v, label: v }))} />
          <Input label="Submitted By" value={form.submittedBy} onChange={e => setForm(p => ({ ...p, submittedBy: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Expense['status'] }))} options={['Pending','Approved','Rejected'].map(v => ({ value: v, label: v }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
