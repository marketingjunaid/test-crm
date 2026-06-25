import { useState } from 'react';
import { getProducts, saveProducts } from '../../store/storage';
import { Product } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', description: '', unit: 'pcs', costPrice: '', sellingPrice: '', currentStock: '', reorderLevel: '' });

  const categories = [...new Set(products.map(p => p.category))];

  const openModal = (p?: Product) => {
    if (p) { setEditProd(p); setForm({ name: p.name, sku: p.sku, category: p.category, description: p.description || '', unit: p.unit, costPrice: String(p.costPrice), sellingPrice: String(p.sellingPrice), currentStock: String(p.currentStock), reorderLevel: String(p.reorderLevel) }); }
    else { setEditProd(null); setForm({ name: '', sku: '', category: '', description: '', unit: 'pcs', costPrice: '', sellingPrice: '', currentStock: '0', reorderLevel: '5' }); }
    setShowModal(true);
  };

  const save = () => {
    const data = { ...form, costPrice: parseFloat(form.costPrice) || 0, sellingPrice: parseFloat(form.sellingPrice) || 0, currentStock: parseInt(form.currentStock) || 0, reorderLevel: parseInt(form.reorderLevel) || 0 };
    let updated: Product[];
    if (editProd) { updated = products.map(p => p.id === editProd.id ? { ...p, ...data } : p); }
    else { updated = [...products, { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString().split('T')[0] }]; }
    saveProducts(updated); setProducts(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = products.filter(p => p.id !== id); saveProducts(u); setProducts(u); };

  const filtered = products.filter(p => (filterCat === 'all' || p.category === filterCat) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));
  const lowStock = products.filter(p => p.currentStock <= p.reorderLevel).length;

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Add Product</Button>} />

      {lowStock > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
          <AlertTriangle size={16} /><span>{lowStock} product{lowStock > 1 ? 's' : ''} at or below reorder level</span>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No products found" action={<Button onClick={() => openModal()}>Add Product</Button>} /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Product</th><th className="text-left px-5 py-3 font-medium text-slate-600">SKU</th><th className="text-left px-5 py-3 font-medium text-slate-600">Category</th><th className="text-left px-5 py-3 font-medium text-slate-600">Cost</th><th className="text-left px-5 py-3 font-medium text-slate-600">Price</th><th className="text-left px-5 py-3 font-medium text-slate-600">Stock</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{filtered.map(p => (
              <tr key={p.id} className={`border-t border-slate-100 hover:bg-slate-50 ${p.currentStock <= p.reorderLevel ? 'bg-amber-50/50' : ''}`}>
                <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                <td className="px-5 py-3"><Badge status={p.category} /></td>
                <td className="px-5 py-3 text-slate-600">${p.costPrice}</td>
                <td className="px-5 py-3 font-medium text-slate-900">${p.sellingPrice}</td>
                <td className="px-5 py-3">
                  <span className={`font-semibold ${p.currentStock <= p.reorderLevel ? 'text-red-500' : 'text-slate-900'}`}>{p.currentStock}</span>
                  <span className="text-slate-400 text-xs"> {p.unit} (reorder: {p.reorderLevel})</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProd ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Product Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <Input label="SKU" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
          <Input label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          <Input label="Cost Price ($)" type="number" value={form.costPrice} onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} />
          <Input label="Selling Price ($)" type="number" value={form.sellingPrice} onChange={e => setForm(p => ({ ...p, sellingPrice: e.target.value }))} />
          <Input label="Current Stock" type="number" value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))} />
          <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} />
          <Input label="Unit" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="pcs, kg, m..." />
          <div className="col-span-2"><Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
