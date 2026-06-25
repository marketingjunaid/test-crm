import { useState } from 'react';
import { getAssets, saveAssets, getEmployees } from '../store/storage';
import { Asset } from '../types';
import PageHeader from '../components/UI/PageHeader';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Textarea from '../components/UI/Textarea';
import EmptyState from '../components/UI/EmptyState';
import { Plus, Trash2, Edit2, Monitor } from 'lucide-react';

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>(getAssets());
  const employees = getEmployees();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState({ name: '', type: 'Hardware', serialNumber: '', purchaseDate: '', cost: '', assignedTo: '', location: '', status: 'Available' as Asset['status'], notes: '' });

  const openModal = (a?: Asset) => {
    if (a) { setEditAsset(a); setForm({ name: a.name, type: a.type, serialNumber: a.serialNumber, purchaseDate: a.purchaseDate, cost: String(a.cost), assignedTo: a.assignedTo, location: a.location, status: a.status, notes: a.notes }); }
    else { setEditAsset(null); setForm({ name: '', type: 'Hardware', serialNumber: '', purchaseDate: '', cost: '', assignedTo: '', location: '', status: 'Available', notes: '' }); }
    setShowModal(true);
  };

  const save = () => {
    const data = { ...form, cost: parseFloat(form.cost) || 0 };
    let updated: Asset[];
    if (editAsset) { updated = assets.map(a => a.id === editAsset.id ? { ...a, ...data } : a); }
    else { updated = [...assets, { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString().split("T")[0] }]; }
    saveAssets(updated); setAssets(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = assets.filter(a => a.id !== id); saveAssets(u); setAssets(u); };

  const filtered = assets.filter(a => (filter === 'all' || a.type === filter || a.status === filter) && (a.name.toLowerCase().includes(search.toLowerCase())));
  const totalValue = assets.reduce((s, a) => s + a.cost, 0);

  return (
    <div>
      <PageHeader title="Asset Management" subtitle="Track company assets and equipment" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Add Asset</Button>} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All</option>
            {['Hardware','Software','Furniture','Vehicle','Equipment'].map(t => <option key={t} value={t}>{t}</option>)}
            {['Available','Assigned','Under Maintenance','Retired'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm"><span className="text-slate-500">Total Value: </span><span className="font-semibold text-slate-900">${totalValue.toLocaleString()}</span></div>
      </div>

      {filtered.length === 0 ? <EmptyState message="No assets found" action={<Button onClick={() => openModal()}>Add Asset</Button>} /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Asset</th><th className="text-left px-5 py-3 font-medium text-slate-600">Type</th><th className="text-left px-5 py-3 font-medium text-slate-600">Serial #</th><th className="text-left px-5 py-3 font-medium text-slate-600">Assigned To</th><th className="text-left px-5 py-3 font-medium text-slate-600">Cost</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{filtered.map(a => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3"><div className="flex items-center gap-2"><Monitor size={14} className="text-slate-400" /><span className="font-medium text-slate-900">{a.name}</span></div></td>
                <td className="px-5 py-3"><Badge status={a.type} /></td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{a.serialNumber || '-'}</td>
                <td className="px-5 py-3 text-slate-600">{a.assignedTo || '-'}</td>
                <td className="px-5 py-3 font-medium text-slate-900">${a.cost.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge status={a.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openModal(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(a.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editAsset ? 'Edit Asset' : 'Add Asset'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Asset Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <Input label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} />
          <Input label="Serial Number" value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))} />
          <Input label="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} />
          <Input label="Cost ($)" type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Asset['status'] }))} options={['Available','Assigned','Under Maintenance','Retired'].map(v => ({ value: v, label: v }))} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
            <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </div>
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
