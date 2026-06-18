import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI/Modal';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Contact } from '../types';

const empty: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
  firstName: '', lastName: '', email: '', phone: '', company: '', title: '',
};

export function Contacts() {
  const { data, addContact, updateContact, deleteContact, searchQuery } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(empty);
  const [localSearch, setLocalSearch] = useState('');

  const q = (localSearch || searchQuery).toLowerCase();
  const contacts = data.contacts.filter(c =>
    !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)
  );

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (c: Contact) => {
    setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, company: c.company, title: c.title });
    setEditing(c); setShowModal(true);
  };

  const handleSave = () => {
    if (!form.firstName) return;
    editing ? updateContact(editing.id, form) : addContact(form);
    setShowModal(false);
  };

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const fields: (keyof typeof empty)[] = ['firstName', 'lastName', 'email', 'phone', 'company', 'title'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.contacts.length} total contacts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search contacts..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Name', 'Email', 'Phone', 'Company', 'Title', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <span className="font-medium text-gray-900">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company}</td>
                  <td className="px-4 py-3 text-gray-600">{c.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteContact(c.id); }} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No contacts found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Contact' : 'Add Contact'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field} className={field === 'email' || field === 'phone' ? '' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={e => set(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
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
