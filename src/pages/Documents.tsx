import { useState } from 'react';
import PageHeader from '../components/UI/PageHeader';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Textarea from '../components/UI/Textarea';
import { Plus, Folder, FileText, Trash2, Edit2, Download, Eye, Search } from 'lucide-react';

interface Doc { id: string; name: string; type: string; folder: string; size: string; uploadedBy: string; date: string; url: string; notes: string; }

const STORAGE_KEY = 'orgos_documents';
const getDocs = (): Doc[] => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const saveDocs = (docs: Doc[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>(getDocs());
  const [folder, setFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [form, setForm] = useState({ name: '', type: 'PDF', folder: 'General', size: '', uploadedBy: '', url: '', notes: '' });

  const folders = ['General', 'Contracts', 'Policies', 'Reports', 'Templates', 'Legal', 'Finance', 'HR'];

  const openModal = (d?: Doc) => {
    if (d) { setEditDoc(d); setForm({ name: d.name, type: d.type, folder: d.folder, size: d.size, uploadedBy: d.uploadedBy, url: d.url, notes: d.notes }); }
    else { setEditDoc(null); setForm({ name: '', type: 'PDF', folder: folder !== 'all' ? folder : 'General', size: '', uploadedBy: '', url: '', notes: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: Doc[];
    if (editDoc) { updated = docs.map(d => d.id === editDoc.id ? { ...d, ...form } : d); }
    else { updated = [...docs, { id: crypto.randomUUID(), ...form, date: new Date().toISOString().split('T')[0] }]; }
    saveDocs(updated); setDocs(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = docs.filter(d => d.id !== id); saveDocs(u); setDocs(u); };

  const filtered = docs.filter(d => (folder === 'all' || d.folder === folder) && (d.name.toLowerCase().includes(search.toLowerCase())));

  const folderCounts: Record<string, number> = {};
  docs.forEach(d => { folderCounts[d.folder] = (folderCounts[d.folder] || 0) + 1; });

  return (
    <div>
      <PageHeader title="Documents" subtitle="Central document repository" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />Upload Document</Button>} />

      <div className="flex gap-6">
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
            <button onClick={() => setFolder('all')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${folder === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Folder size={15} />All Documents<span className="ml-auto text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{docs.length}</span>
            </button>
            {folders.map(f => (
              <button key={f} onClick={() => setFolder(f)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${folder === f ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Folder size={15} />{f}{folderCounts[f] ? <span className="ml-auto text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{folderCounts[f]}</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center"><FileText size={40} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-400">No documents in this folder</p><Button className="mt-4" onClick={() => openModal()}>Upload First Document</Button></div>
          ) : (
            <div className="space-y-2">
              {filtered.map(d => (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:border-indigo-200">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-red-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.type} · {d.size || 'Unknown size'} · Uploaded by {d.uploadedBy} on {d.date}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{d.folder}</span>
                  <div className="flex gap-1">
                    {d.url && <><a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Eye size={14} /></a><a href={d.url} download className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Download size={14} /></a></>}
                    <button onClick={() => openModal(d)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => del(d.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDoc ? 'Edit Document' : 'Upload Document'}>
        <div className="space-y-3">
          <Input label="Document Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={['PDF','Word','Excel','PowerPoint','Image','Other'].map(v => ({ value: v, label: v }))} />
            <Select label="Folder" value={form.folder} onChange={e => setForm(p => ({ ...p, folder: e.target.value }))} options={folders.map(v => ({ value: v, label: v }))} />
          </div>
          <Input label="File Size (e.g. 2.4 MB)" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} />
          <Input label="Uploaded By" value={form.uploadedBy} onChange={e => setForm(p => ({ ...p, uploadedBy: e.target.value }))} />
          <Input label="File URL (optional)" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." />
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>
    </div>
  );
}
