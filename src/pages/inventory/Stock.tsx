import { useState } from 'react';
import { getStock, saveStock, getProducts, saveProducts } from '../../store/storage';
import { StockMovement } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { Plus, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

export default function Stock() {
  const [movements, setMovements] = useState<StockMovement[]>(getStock());
  const [products, setProds] = useState(getProducts());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ productId: '', type: 'In' as StockMovement['type'], quantity: '', reason: '', date: new Date().toISOString().split('T')[0] });

  const save = () => {
    const qty = parseInt(form.quantity) || 0;
    const prodName2 = products.find(p => p.id === form.productId)?.name || '';
    const newMov: StockMovement = { id: crypto.randomUUID(), productId: form.productId, productName: prodName2, type: form.type, quantity: qty, reason: form.reason, date: form.date, createdAt: new Date().toISOString().split('T')[0] };
    const updatedMovs = [...movements, newMov];

    const updatedProds = products.map(p => {
      if (p.id !== form.productId) return p;
      const delta = form.type === 'In' ? qty : form.type === 'Out' ? -qty : 0;
      return { ...p, currentStock: Math.max(0, p.currentStock + delta) };
    });

    saveStock(updatedMovs); setMovements(updatedMovs);
    saveProducts(updatedProds); setProds(updatedProds);
    setShowModal(false);
    setForm({ productId: '', type: 'In', quantity: '', reason: '', date: new Date().toISOString().split('T')[0] });
  };

  const prodName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';

  const TypeIcon = ({ type }: { type: string }) => type === 'In' ? <TrendingUp size={14} className="text-emerald-500" /> : type === 'Out' ? <TrendingDown size={14} className="text-red-500" /> : <RotateCcw size={14} className="text-amber-500" />;

  return (
    <div>
      <PageHeader title="Stock Movements" subtitle="Track inventory in and out" action={<Button onClick={() => setShowModal(true)}><Plus size={16} className="mr-1" />Record Movement</Button>} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Stock In', count: movements.filter(m => m.type === 'In').reduce((s,m) => s+m.quantity,0), icon: <TrendingUp size={18} />, color: 'text-emerald-600 bg-emerald-50' }, { label: 'Stock Out', count: movements.filter(m => m.type === 'Out').reduce((s,m) => s+m.quantity,0), icon: <TrendingDown size={18} />, color: 'text-red-500 bg-red-50' }, { label: 'Adjustments', count: movements.filter(m => m.type === 'Adjustment').length, icon: <RotateCcw size={18} />, color: 'text-amber-600 bg-amber-50' }].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div><p className="text-2xl font-bold text-slate-900">{s.count}</p><p className="text-sm text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Product</th><th className="text-left px-5 py-3 font-medium text-slate-600">Type</th><th className="text-left px-5 py-3 font-medium text-slate-600">Quantity</th><th className="text-left px-5 py-3 font-medium text-slate-600">Reason</th><th className="text-left px-5 py-3 font-medium text-slate-600">Reference</th></tr></thead>
          <tbody>
            {movements.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No stock movements yet</td></tr> : movements.sort((a,b) => b.date.localeCompare(a.date)).map(m => (
              <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">{m.date}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{prodName(m.productId)}</td>
                <td className="px-5 py-3"><div className="flex items-center gap-1.5"><TypeIcon type={m.type} /><Badge status={m.type} /></div></td>
                <td className="px-5 py-3 font-semibold text-slate-900">{m.type === 'Out' ? '-' : '+'}{m.quantity}</td>
                <td className="px-5 py-3 text-slate-500">{m.reason}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{m.productName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Stock Movement">
        <div className="space-y-3">
          <Select label="Product" value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} options={products.map(p => ({ value: p.id, label: `${p.name} (Stock: ${p.currentStock})` }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as StockMovement['type'] }))} options={['In','Out','Adjustment'].map(v => ({ value: v, label: v }))} />
            <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
          </div>
          <Input label="Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <Input label="Reason" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Purchase, Sale, Damage..." />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
