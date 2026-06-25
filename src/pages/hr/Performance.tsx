import { useState } from 'react';
import { getPerformance, savePerformance, getEmployees } from '../../store/storage';
import { PerformanceReview } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import { Plus, Star, Trash2, Edit2 } from 'lucide-react';

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" onClick={() => onChange?.(i)} className={`${onChange ? 'cursor-pointer' : 'cursor-default'}`}>
        <Star size={16} className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      </button>
    ))}
  </div>
);

export default function Performance() {
  const [reviews, setReviews] = useState<PerformanceReview[]>(getPerformance());
  const employees = getEmployees();
  const [showModal, setShowModal] = useState(false);
  const [editRev, setEditRev] = useState<PerformanceReview | null>(null);
  const [form, setForm] = useState({ employeeId: '', period: '', rating: 3, goals: '', selfAssessment: '', managerComments: '', status: 'Draft' as PerformanceReview['status'] });

  const openModal = (rev?: PerformanceReview) => {
    if (rev) { setEditRev(rev); setForm({ employeeId: rev.employeeId, period: rev.period, rating: rev.rating, goals: rev.goals, selfAssessment: rev.selfAssessment, managerComments: rev.managerComments, status: rev.status }); }
    else { setEditRev(null); setForm({ employeeId: '', period: '', rating: 3, goals: '', selfAssessment: '', managerComments: '', status: 'Draft' }); }
    setShowModal(true);
  };

  const save = () => {
    const empName = employees.find(e => e.id === form.employeeId)?.name || '';
    let updated: PerformanceReview[];
    if (editRev) { updated = reviews.map(r => r.id === editRev.id ? { ...r, ...form, employeeName: empName } : r); }
    else { updated = [...reviews, { id: crypto.randomUUID(), ...form, employeeName: empName, createdAt: new Date().toISOString().split('T')[0] }]; }
    savePerformance(updated); setReviews(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = reviews.filter(r => r.id !== id); savePerformance(u); setReviews(u); };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div>
      <PageHeader title="Performance Reviews" subtitle="Track employee performance evaluations" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Review</Button>} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Reviews', value: reviews.length, color: 'text-indigo-600' }, { label: 'Avg Rating', value: `${avgRating}/5`, color: 'text-amber-500' }, { label: 'Reviewed', value: reviews.filter(r => r.status === 'Reviewed').length, color: 'text-emerald-600' }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Employee</th><th className="text-left px-5 py-3 font-medium text-slate-600">Period</th><th className="text-left px-5 py-3 font-medium text-slate-600">Rating</th><th className="text-left px-5 py-3 font-medium text-slate-600">Goals</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
          <tbody>
            {reviews.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No reviews yet</td></tr> : reviews.map(r => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{r.employeeName}</td>
                <td className="px-5 py-3 text-slate-600">{r.period}</td>
                <td className="px-5 py-3"><StarRating value={r.rating} /></td>
                <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{r.goals}</td>
                <td className="px-5 py-3"><Badge status={r.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openModal(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editRev ? 'Edit Review' : 'New Performance Review'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={employees.map(e => ({ value: e.id, label: e.name }))} />
            <Input label="Period (e.g. Q1 2025)" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>
          <Textarea label="Goals" value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} rows={2} />
          <Textarea label="Self Assessment" value={form.selfAssessment} onChange={e => setForm(p => ({ ...p, selfAssessment: e.target.value }))} rows={2} />
          <Textarea label="Manager Comments" value={form.managerComments} onChange={e => setForm(p => ({ ...p, managerComments: e.target.value }))} rows={2} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as PerformanceReview['status'] }))} options={['Draft','Submitted','Reviewed'].map(v => ({ value: v, label: v }))} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
