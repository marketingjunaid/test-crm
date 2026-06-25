import { useState } from 'react';
import { getBudgets, saveBudgets } from '../../store/storage';
import { Budget } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>(getBudgets());
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [form, setForm] = useState({ department: '', year: new Date().getFullYear(), totalBudget: '', spent: '0', category: '', notes: '' });

  const openModal = (b?: Budget) => {
    if (b) { setEditBudget(b); setForm({ department: b.department, year: b.year, totalBudget: String(b.totalBudget), spent: String(b.spent), category: b.category, notes: b.notes }); }
    else { setEditBudget(null); setForm({ department: '', year: new Date().getFullYear(), totalBudget: '', spent: '0', category: '', notes: '' }); }
    setShowModal(true);
  };

  const save = () => {
    const totalBudget = parseFloat(form.totalBudget) || 0;
    const spent = parseFloat(form.spent) || 0;
    let updated: Budget[];
    if (editBudget) { updated = budgets.map(b => b.id === editBudget.id ? { ...b, ...form, totalBudget, spent, year: Number(form.year) } : b); }
    else { updated = [...budgets, { id: crypto.randomUUID(), ...form as any, totalBudget, spent, year: Number(form.year) }]; }
    saveBudgets(updated); setBudgets(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = budgets.filter(b => b.id !== id); saveBudgets(u); setBudgets(u); };

  const totalAllocated = budgets.reduce((s, b) => s + b.totalBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div>
      <PageHeader title="Budget" subtitle="Track departmental budgets and spending" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Add Budget</Button>} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Budget', value: `$${totalAllocated.toLocaleString()}`, color: 'text-indigo-600' }, { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, color: 'text-amber-500' }, { label: 'Remaining', value: `$${(totalAllocated - totalSpent).toLocaleString()}`, color: 'text-emerald-600' }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {budgets.map(b => {
          const remaining = b.totalBudget - b.spent;
          const pct = b.totalBudget > 0 ? Math.min(100, Math.round((b.spent / b.totalBudget) * 100)) : 0;
          const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-500';
          return (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-slate-900">{b.department}</h3><Badge status={b.category} /></div>
                  <p className="text-sm text-slate-500">Year {b.year}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(b)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => del(b.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div><p className="text-slate-400">Total Budget</p><p className="font-semibold text-slate-800">${b.totalBudget.toLocaleString()}</p></div>
                <div><p className="text-slate-400">Spent</p><p className="font-semibold text-slate-800">${b.spent.toLocaleString()}</p></div>
                <div><p className="text-slate-400">Remaining</p><p className={`font-semibold ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>${remaining.toLocaleString()}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2"><div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
                <span className="text-sm font-medium text-slate-600">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editBudget ? 'Edit Budget' : 'Add Budget'}>
        <div className="space-y-3">
          <Input label="Department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
          <Input label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Marketing, Operations..." />
          <Input label="Year" type="number" value={String(form.year)} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || p.year }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total Budget ($)" type="number" value={form.totalBudget} onChange={e => setForm(p => ({ ...p, totalBudget: e.target.value }))} />
            <Input label="Spent ($)" type="number" value={form.spent} onChange={e => setForm(p => ({ ...p, spent: e.target.value }))} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
