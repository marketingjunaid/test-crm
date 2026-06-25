import { useState } from 'react';
import { getKB, saveKB } from '../../store/storage';
import { KBArticle } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KBArticle[]>(getKB());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editArt, setEditArt] = useState<KBArticle | null>(null);
  const [viewArt, setViewArt] = useState<KBArticle | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', status: 'Draft' as KBArticle['status'], author: '' });

  const categories = [...new Set(articles.map(a => a.category))];

  const openModal = (a?: KBArticle) => {
    if (a) { setEditArt(a); setForm({ title: a.title, content: a.content, category: a.category, status: a.status, author: a.author }); }
    else { setEditArt(null); setForm({ title: '', content: '', category: 'General', status: 'Draft', author: '' }); }
    setShowModal(true);
  };

  const save = () => {
    let updated: KBArticle[];
    if (editArt) {
      updated = articles.map(a => a.id === editArt.id ? { ...a, ...form } : a);
    } else {
      const newArt: KBArticle = { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString().split('T')[0] };
      updated = [...articles, newArt];
    }
    saveKB(updated); setArticles(updated); setShowModal(false);
  };

  const del = (id: string) => { const u = articles.filter(a => a.id !== id); saveKB(u); setArticles(u); };

  const filtered = articles.filter(a => (filterCat === 'all' || a.category === filterCat) && (a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Articles and documentation" action={<Button onClick={() => openModal()}><Plus size={16} className="mr-1" />New Article</Button>} />

      <div className="flex gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-2">
          <button onClick={() => setFilterCat('all')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterCat === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>All</button>
          {categories.map(c => <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filterCat === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{c}</button>)}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState message="No articles found" action={<Button onClick={() => openModal()}>Write Article</Button>} /> : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-indigo-200 cursor-pointer" onClick={() => setViewArt(a)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><BookOpen size={16} className="text-indigo-500" /><Badge status={a.category} /><Badge status={a.status} /></div>
                  <h3 className="font-semibold text-slate-900 mb-1">{a.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{a.content.slice(0, 150)}...</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>By {a.author}</span><span>{a.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openModal(a)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => del(a.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editArt ? 'Edit Article' : 'New Article'} size="xl">
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
            <Input label="Author" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as KBArticle['status'] }))} options={['Draft','Published'].map(v => ({ value: v, label: v }))} />
          </div>
          <Textarea label="Content" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={10} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
      </Modal>

      {viewArt && (
        <Modal isOpen={!!viewArt} onClose={() => setViewArt(null)} title={viewArt.title} size="xl">
          <div className="flex gap-2 mb-4"><Badge status={viewArt.category} /><Badge status={viewArt.status} /></div>
          <div className="text-sm text-slate-500 mb-3">By {viewArt.author} · {viewArt.createdAt}</div>
          <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{viewArt.content}</div>
        </Modal>
      )}
    </div>
  );
}
