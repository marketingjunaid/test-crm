import { useState } from 'react';
import { getInvoices, saveInvoices } from '../../store/storage';
import { Invoice, InvoiceItem } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, PlusCircle, MinusCircle, Download, FileText } from 'lucide-react';
import { downloadCSV, printTable } from '../../utils/export';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(getInvoices());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editInv, setEditInv] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ invoiceNumber: '', clientName: '', clientEmail: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'Draft' as Invoice['status'], notes: '' });
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]);

  const openModal = (inv?: Invoice) => {
    if (inv) { setEditInv(inv); setForm({ invoiceNumber: inv.invoiceNumber, clientName: inv.clientName, clientEmail: inv.clientEmail, issueDate: inv.issueDate, dueDate: inv.dueDate, status: inv.status, notes: inv.notes || '' }); setItems(inv.items); }
    else { setEditInv(null); setForm({ invoiceNumber: `INV-${String(invoices.length + 1).padStart(4, '0')}`, clientName: '', clientEmail: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'Draft' as Invoice['status'], notes: '' }); setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }]); }
    setShowModal(true);
  };

  const updateItem = (id: string, field: string, val: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      updated.amount = updated.quantity * updated.rate;
      return updated;
    }));
  };

  const addItem = () => setItems(p => [...p, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const save = () => {
    let updated: Invoice[];
    if (editInv) { updated = invoices.map(i => i.id === editInv.id ? { ...i, ...form, items, subtotal, tax, total } : i); }
    else { updated = [...invoices, { id: crypto.randomUUID(), ...form as any, items, subtotal, tax, discount: 0, total, createdAt: new Date().toISOString().split('T')[0] }]; }
    saveInvoices(updated); setInvoices(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = invoices.filter(i => i.id !== id); saveInvoices(u); setInvoices(u); };
  const markStatus = (id: string, status: Invoice['status']) => { const u = invoices.map(i => i.id === id ? { ...i, status } : i); saveInvoices(u); setInvoices(u); };

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const tabs = ['all', 'Draft', 'Sent', 'Paid', 'Overdue'];

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Create and manage client invoices" action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            const hdrs = ['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Total', 'Status'];
            const rows = filtered.map(i => [i.invoiceNumber, i.clientName, i.issueDate, i.dueDate, i.total, i.status]);
            downloadCSV(`invoices-${filter}.csv`, hdrs, rows);
          }}><Download size={14} /> CSV</Button>
          <Button variant="secondary" onClick={() => {
            const hdrs = ['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Total', 'Status'];
            const rows = filtered.map(i => [i.invoiceNumber, i.clientName, i.issueDate, i.dueDate, `$${i.total.toLocaleString()}`, i.status]);
            printTable('Invoices Report', hdrs, rows);
          }}><FileText size={14} /> PDF</Button>
          <Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Invoice</Button>
        </div>
      } />

      <div className="flex gap-2 mb-6">
        {tabs.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{t === 'all' ? 'All' : t}</button>)}
      </div>

      {filtered.length === 0 ? <EmptyState message="No invoices found" action={<Button onClick={() => openModal()}>Create Invoice</Button>} /> : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="text-left px-5 py-3 font-medium text-slate-600">Invoice #</th><th className="text-left px-5 py-3 font-medium text-slate-600">Client</th><th className="text-left px-5 py-3 font-medium text-slate-600">Issue Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Due Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>{filtered.map(inv => (
              <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-indigo-600">{inv.invoiceNumber}</td>
                <td className="px-5 py-3"><div><p className="font-medium text-slate-900">{inv.clientName}</p><p className="text-xs text-slate-400">{inv.clientEmail}</p></div></td>
                <td className="px-5 py-3 text-slate-500">{inv.issueDate}</td>
                <td className="px-5 py-3 text-slate-500">{inv.dueDate}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">${inv.total.toLocaleString()}</td>
                <td className="px-5 py-3"><Badge status={inv.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    {inv.status === 'Draft' && <button onClick={() => markStatus(inv.id, 'Sent')} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Send</button>}
                    {inv.status === 'Sent' && <button onClick={() => markStatus(inv.id, 'Paid')} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Mark Paid</button>}
                    <button onClick={() => openModal(inv)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                    <button onClick={() => del(inv.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editInv ? 'Edit Invoice' : 'New Invoice'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Invoice #" value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} />
            <Input label="Issue Date" type="date" value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            <Input label="Client Name" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} />
            <Input label="Client Email" value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Invoice['status'] }))} options={['Draft','Sent','Paid','Overdue','Cancelled'].map(v => ({ value: v, label: v }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-slate-700">Line Items</label><button onClick={addItem} className="text-indigo-600 hover:text-indigo-700"><PlusCircle size={18} /></button></div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50"><th className="text-left px-3 py-2 font-medium text-slate-600">Description</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-20">Qty</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-28">Rate ($)</th><th className="text-left px-3 py-2 font-medium text-slate-600 w-28">Amount</th><th className="w-8"></th></tr></thead>
                <tbody>{items.map(item => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-2 py-1"><input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Service description" /></td>
                    <td className="px-2 py-1"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                    <td className="px-2 py-1"><input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" /></td>
                    <td className="px-3 py-2 font-medium">${item.amount.toFixed(2)}</td>
                    <td className="px-1 py-1"><button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><MinusCircle size={15} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="mt-3 text-sm text-right space-y-1">
              <p className="text-slate-500">Subtotal: <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span></p>
              <p className="text-slate-500">Tax (10%): <span className="font-medium text-slate-800">${tax.toFixed(2)}</span></p>
              <p className="text-base font-bold text-slate-900">Total: ${total.toFixed(2)}</p>
            </div>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save Invoice</Button></div>
      </Modal>
    </div>
  );
}
