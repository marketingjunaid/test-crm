import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI/Modal';
import { Plus, Pencil, Trash2, Search, Globe } from 'lucide-react';
import type { Company } from '../types';

const INDUSTRIES = ['Technology', 'Manufacturing', 'Finance', 'Healthcare', 'Retail', 'Education', 'Other'];

const empty: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', industry: 'Technology', website: '', phone: '', employees: 0, revenue: '',
};

export function Companies() {
  const { data, addCompany, updateCompany, deleteCompany, searchQuery } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(empty);
  const [localSearch, setLocalSearch] = useState('');

  const q = (localSearch || searchQuery).toLowerCase();
  const companies = data.companies.filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
  );

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (c: Company) => {
    setForm({ name: c.name, industry: c.industry, website: c.website, phone: c.phone, employees: c.employees, revenue: c.revenue });
    setEditing(c); setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    editing ? updateCompany(editing.id, form) : addCompany(form);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.companies.length} total companies</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Company', 'Industry', 'Website', 'Phone', 'Employees', 'Revenue', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{c.industry}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><Globe size={12} />{c.website.replace('https://', '')}</a>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.employees.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{c.revenue}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteCompany(c.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No companies found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Company' : 'Add Company'} onClose={() => setShowModal(false)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
              <input type="number" value={form.employees} onChange={e => setForm(f => ({ ...f, employees: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
              <input value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} placeholder="e.g. $50M" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
