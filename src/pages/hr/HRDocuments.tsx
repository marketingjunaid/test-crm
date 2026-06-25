import { useState } from 'react';
import { getHRDocs, saveHRDocs, getEmployees } from '../../store/storage';
import { HRDocument } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, FileText, Trash2 } from 'lucide-react';

export default function HRDocuments() {
  const [docs, setDocs] = useState<HRDocument[]>(getHRDocs());
  const employees = getEmployees();
  const [filterType, setFilterType] = useState('all');
  const [filterEmp, setFilterEmp] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', employeeName: '', name: '', type: 'Contract', fileName: '' });

  const docTypes = ['Contract', 'Offer Letter', 'NDA', 'ID Proof', 'Certificate', 'Policy', 'Other'];

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    const newDoc: HRDocument = { id: crypto.randomUUID(), ...form, employeeName: emp?.name || form.employeeName, uploadedAt: new Date().toISOString().split('T')[0] };
    const updated = [...docs, newDoc];
    saveHRDocs(updated); setDocs(updated); setShowModal(false);
    setForm({ employeeId: '', employeeName: '', name: '', type: 'Contract', fileName: '' });
  };

  const del = (id: string) => { const u = docs.filter(d => d.id !== id); saveHRDocs(u); setDocs(u); };

  const filtered = docs.filter(d => (filterType === 'all' || d.type === filterType) && (filterEmp === 'all' || d.employeeId === filterEmp));

  return (
    <div>
      <PageHeader title="HR Documents" subtitle="Manage employee documents and records" action={<Button onClick={() => setShowModal(true)}><Plus size={16} className="mr-1" />Add Document</Button>} />

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Types</option>
          {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No documents found" action={<Button onClick={() => setShowModal(true)}>Add First Document</Button>} /> : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText size={20} className="text-indigo-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">{doc.name}</p>
                  <Badge status={doc.type} />
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>Employee: {doc.employeeName}</span>
                  <span>File: {doc.fileName || 'N/A'}</span>
                  <span>Uploaded: {doc.uploadedAt}</span>
                </div>
              </div>
              <button onClick={() => del(doc.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add HR Document">
        <div className="space-y-3">
          <Select label="Employee" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} options={[{ value: '', label: 'Company (General)' }, ...employees.map(e => ({ value: e.id, label: e.name }))]} />
          <Input label="Document Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Select label="Document Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={docTypes.map(v => ({ value: v, label: v }))} />
          <Input label="File Name / Reference" value={form.fileName} onChange={e => setForm(p => ({ ...p, fileName: e.target.value }))} placeholder="document.pdf" />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
