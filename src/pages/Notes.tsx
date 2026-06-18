import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI/Modal';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import type { Note } from '../types';

type RelatedType = Note['relatedType'];
const RELATED_TYPES: RelatedType[] = ['Lead', 'Contact', 'Company', 'Deal'];

const empty: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', content: '', relatedTo: '', relatedType: 'Lead',
};

export function Notes() {
  const { data, addNote, updateNote, deleteNote } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState(empty);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (n: Note) => {
    setForm({ title: n.title, content: n.content, relatedTo: n.relatedTo, relatedType: n.relatedType });
    setEditing(n); setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    editing ? updateNote(editing.id, form) : addNote(form);
    setShowModal(false);
  };

  const typeColors: Record<RelatedType, string> = {
    Lead: 'bg-purple-100 text-purple-700',
    Contact: 'bg-blue-100 text-blue-700',
    Company: 'bg-indigo-100 text-indigo-700',
    Deal: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.notes.length} notes</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.notes.map(note => (
          <div key={note.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <FileText size={16} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{note.title}</h3>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <button onClick={() => openEdit(note)} className="p-1 hover:bg-blue-50 rounded text-blue-600"><Pencil size={13} /></button>
                <button onClick={() => { if (confirm('Delete?')) deleteNote(note.id); }} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 flex-1 leading-relaxed">{note.content}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[note.relatedType]}`}>{note.relatedType}</span>
                <span className="text-xs text-gray-500">{note.relatedTo}</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {data.notes.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p>No notes yet. Add your first note!</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Note' : 'Add Note'} onClose={() => setShowModal(false)} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Type</label>
                <select value={form.relatedType} onChange={e => setForm(f => ({ ...f, relatedType: e.target.value as RelatedType }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {RELATED_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related To</label>
                <input value={form.relatedTo} onChange={e => setForm(f => ({ ...f, relatedTo: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
