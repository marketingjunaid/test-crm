import { useState } from 'react';
import { getVendors, saveVendors } from '../../store/storage';
import { Vendor } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, Phone, Mail, Star } from 'lucide-react';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>(getVendors());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', category: '', paymentTerms: 'Net 30', rating: 3, notes: '' });

  const openModal = (v?: Vendor) => {
    if (v) { setEditVendor(v); setForm({ name: v.name, email: v.email, phone: v.phone, address: v.address || '', category: v.category, paymentTerms: v.paymentTerms, rating: v.rating, notes: v.notes || '' }); }
    else { setEditVendor(null); setForm({ name: '', email: '', phone: '', address: '', category: '', paymentTerms: 'Net 30', rating: 3, notes: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: Vendor[];
    if (editVendor) { updated = vendors.map(v => v.id === editVendor.id ? { ...v, ...form } : v); }
    else { updated = [...vendors, { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString().split('T')[0] }]; }
    saveVendors(updated); setVendors(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = vendors.filter(v => v.id !== id); saveVendors(u); setVendors(u); };

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Vendors" subtitle="Manage supplier and vendor relationships" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Add Vendor</Button>} />

      <div className="mb-6"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>

      {filtered.length === 0 ? <EmptyState message="No vendors found" action={<Button onClick={() => openModal()}>Add Vendor</Button>} /> : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">{v.name.charAt(0)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">{v.name}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{v.category}</span>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={11} className={i <= v.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />)}</div>
                </div>
                <p className="text-sm text-slate-500 mb-2">Terms: {v.paymentTerms}</p>
                <div className="flex gap-4 text-xs text-slate-400">
                  {v.email && <span className="flex items-center gap-1"><Mail size={11} />{v.email}</span>}
                  {v.phone && <span className="flex items-center gap-1"><Phone size={11} />{v.phone}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(v)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                <button onClick={() => del(v.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editVendor ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Company Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <Input label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Supplier, Service..." />
          <Select label="Payment Terms" value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))} options={['Net 15','Net 30','Net 45','Net 60','Immediate'].map(v => ({ value: v, label: v }))} />
          <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Rating (1-5)" type="number" value={String(form.rating)} onChange={e => setForm(p => ({ ...p, rating: parseInt(e.target.value) || 3 }))} />
          <div className="col-span-2"><Textarea label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} /></div>
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
