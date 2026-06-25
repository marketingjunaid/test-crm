import { useState } from 'react';
import { getPOs, savePOs, getVendors } from '../../store/storage';
import { PurchaseOrder, POItem } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, PlusCircle, MinusCircle } from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(getPOs());
  const vendors = getVendors();
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState({ poNumber: '', vendorId: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', status: 'Draft' as PurchaseOrder['status'], notes: '' });
  const [items, setItems] = useState<POItem[]>([{ id: '1', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);

  const openModal = (o?: PurchaseOrder) => {
    if (o) { setEditOrder(o); setForm({ poNumber: o.poNumber, vendorId: o.vendorId, orderDate: o.orderDate, expectedDelivery: o.expectedDelivery, status: o.status, notes: o.notes || '' }); setItems(o.items); }
    else { setEditOrder(null); setForm({ poNumber: `PO-${String(orders.length + 1).padStart(4, '0')}`, vendorId: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', status: 'Draft', notes: '' }); setItems([{ id: crypto.randomUUID(), productName: '', quantity: 1, unitPrice: 0, total: 0 }]); }
    setShowModal(true);
  };

  const updateItem = (id: string, field: string, val: string | number) => {
    setItems(prev => prev.map(i => { if (i.id !== id) return i; const u = { ...i, [field]: val }; u.total = u.quantity * u.unitPrice; return u; }));
  };

  const total = items.reduce((s, i) => s + i.total, 0);

  const save = () => {
    const vendorName = vendors.find(v => v.id === form.vendorId)?.name || '';
    let updated: PurchaseOrder[];
    if (editOrder) { updated = orders.map(o => o.id === editOrder.id ? { ...o, ...form, vendorName, items, total } : o); }
    else { updated = [...orders, { id: crypto.randomUUID(), ...form, vendorName, items, total, createdAt: new Date().toISOString().split('T')[0] }]; }
    savePOs(updated); setOrders(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = orders.filter(o => o.id !== id); savePOs(u); setOrders(u); };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <PageHeader title="Purchase Orders" subtitle="Manage procurement orders" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New PO</Button>} />

      <div className="flex gap-2 mb-6">
        {['all','Draft','Sent','Received','Cancelled'].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{s === 'all' ? 'All' : s}</button>)}
      </div>

      {filtered.length === 0 ? <EmptyState message="No purchase orders" action={<Button onClick={() => openModal()}>Create PO</Button>} /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">PO #</th><th className="text-left px-5 py-3 font-medium text-slate-600">Vendor</th><th className="text-left px-5 py-3 font-medium text-slate-600">Order Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Expected</th><th className="text-left px-5 py-3 font-medium text-slate-600">Total</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{filtered.map(o => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-indigo-600">{o.poNumber}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{o.vendorName}</td>
                <td className="px-5 py-3 text-slate-500">{o.orderDate}</td>
                <td className="px-5 py-3 text-slate-500">{o.expectedDelivery}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">${o.total.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge status={o.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openModal(o)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(o.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editOrder ? 'Edit PO' : 'New Purchase Order'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="PO Number" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} />
            <Input label="Order Date" type="date" value={form.orderDate} onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
            <Input label="Expected Delivery" type="date" value={form.expectedDelivery} onChange={e => setForm(p => ({ ...p, expectedDelivery: e.target.value }))} />
            <Select label="Vendor" value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))} options={vendors.map(v => ({ value: v.id, label: v.name }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as PurchaseOrder['status'] }))} options={['Draft','Sent','Received','Cancelled'].map(v => ({ value: v, label: v }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-slate-700">Items</label><button onClick={() => setItems(p => [...p, { id: crypto.randomUUID(), productName: '', quantity: 1, unitPrice: 0, total: 0 }])} className="text-indigo-600 hover:text-indigo-700"><PlusCircle size={18} /></button></div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50"><th className="text-left px-3 py-2 font-medium text-slate-600">Product</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-20">Qty</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-28">Unit Price</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-24">Total</th><th className="w-8"></th></tr></thead>
                <tbody>{items.map(item => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-2 py-1"><input value={item.productName} onChange={e => updateItem(item.id, 'productName', e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                    <td className="px-2 py-1"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value)||0)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                    <td className="px-2 py-1"><input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value)||0)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                    <td className="px-3 py-2 font-medium">${item.total.toFixed(2)}</td>
                    <td className="px-1"><button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500"><MinusCircle size={15} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="text-right text-sm font-bold text-slate-900 mt-2">Total: ${total.toFixed(2)}</p>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save PO</Button></div>
      </Modal>
    </div>
  );
}
