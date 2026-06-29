import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, LayoutGrid, List, TrendingUp, DollarSign, Target, Trophy } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { getDeals, saveDeals } from '../../store/storage';
import { fireTrigger } from '../../utils/automationEngine';
import type { Deal } from '../../types';

const STAGES: Deal['stage'][] = ['Prospect','Qualified','Proposal','Negotiation','Won','Lost'];

const STAGE_META: Record<string, { bg: string; text: string; border: string; dot: string; header: string }> = {
  Prospect:    { bg:'bg-slate-50',    text:'text-slate-700',   border:'border-slate-200', dot:'bg-slate-400',    header:'bg-slate-100' },
  Qualified:   { bg:'bg-blue-50',     text:'text-blue-700',    border:'border-blue-200',  dot:'bg-blue-500',     header:'bg-blue-100' },
  Proposal:    { bg:'bg-violet-50',   text:'text-violet-700',  border:'border-violet-200',dot:'bg-violet-500',   header:'bg-violet-100' },
  Negotiation: { bg:'bg-amber-50',    text:'text-amber-700',   border:'border-amber-200', dot:'bg-amber-500',    header:'bg-amber-100' },
  Won:         { bg:'bg-emerald-50',  text:'text-emerald-700', border:'border-emerald-200',dot:'bg-emerald-500', header:'bg-emerald-100' },
  Lost:        { bg:'bg-rose-50',     text:'text-rose-700',    border:'border-rose-200',  dot:'bg-rose-500',     header:'bg-rose-100' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const empty: Omit<Deal, 'id' | 'createdAt'> = { title: '', company: '', contact: '', value: 0, stage: 'Prospect', probability: 20, expectedClose: '', assignedTo: '', notes: '' };

function ProbabilityBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-slate-300';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
      <div className={`${color} h-1 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState(getDeals());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState<Omit<Deal, 'id' | 'createdAt'>>(empty);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragStage = useRef<string | null>(null);

  const persist = (updated: Deal[]) => { saveDeals(updated); setDeals(updated); };

  const save = () => {
    const updated = editing
      ? deals.map(d => d.id === editing.id ? { ...editing, ...form } : d)
      : [...deals, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }];
    persist(updated); setModal(false); setEditing(null); setForm(empty);
  };

  const del = (id: string) => { if (!confirm('Delete deal?')) return; persist(deals.filter(d => d.id !== id)); };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({ title: d.title, company: d.company, contact: d.contact, value: d.value, stage: d.stage, probability: d.probability, expectedClose: d.expectedClose, assignedTo: d.assignedTo, notes: d.notes });
    setModal(true);
  };

  // Drag and drop
  const onDragStart = (e: React.DragEvent, deal: Deal) => {
    setDragId(deal.id);
    dragStage.current = deal.stage;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, stage: Deal['stage']) => {
    e.preventDefault();
    if (!dragId || dragStage.current === stage) { setDragId(null); setDragOver(null); return; }
    const deal = deals.find(d => d.id === dragId);
    persist(deals.map(d => d.id === dragId ? { ...d, stage } : d));
    if (deal) {
      fireTrigger('deal_stage_changed', { name: deal.title, stage });
      if (stage === 'Won') fireTrigger('deal_won', { name: deal.title, value: String(deal.value) });
      if (stage === 'Lost') fireTrigger('deal_lost', { name: deal.title });
    }
    setDragId(null); setDragOver(null);
  };

  // Stats
  const activeDeals = deals.filter(d => d.stage !== 'Lost');
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const pipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const weighted = activeDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);
  const winRate = deals.length ? Math.round(wonDeals.length / deals.filter(d => d.stage === 'Won' || d.stage === 'Lost').length * 100) || 0 : 0;

  const stats = [
    { label: 'Pipeline Value', value: fmt(pipeline), icon: <TrendingUp size={16} />, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Weighted Value', value: fmt(weighted), icon: <DollarSign size={16} />, color: 'text-violet-600 bg-violet-50' },
    { label: 'Active Deals', value: activeDeals.length, icon: <Target size={16} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Win Rate', value: `${winRate}%`, icon: <Trophy size={16} />, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div>
      <PageHeader
        title="Deals Pipeline"
        subtitle="Track and manage your deals across stages"
        action={
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('board')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'board' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutGrid size={13} /> Board
              </button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <List size={13} /> List
              </button>
            </div>
            <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}>
              <Plus size={15} /> Add Deal
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const m = STAGE_META[stage];
            const stageDeals = deals.filter(d => d.stage === stage);
            const total = stageDeals.reduce((s, d) => s + d.value, 0);
            const isOver = dragOver === stage;
            return (
              <div
                key={stage}
                className="flex-shrink-0 w-64"
                onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, stage)}
              >
                {/* Column header */}
                <div className={`rounded-xl px-3 py-2.5 mb-3 border ${m.header} ${m.border} transition-all ${isOver ? 'ring-2 ring-indigo-400' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${m.dot}`} />
                      <span className={`text-xs font-semibold ${m.text}`}>{stage}</span>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${m.bg} ${m.text}`}>{stageDeals.length}</span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${m.text} opacity-80`}>{fmt(total)}</p>
                </div>

                {/* Cards */}
                <div className={`flex flex-col gap-2 min-h-[120px] rounded-xl transition-all ${isOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-dashed' : ''}`}>
                  {stageDeals.map(d => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={e => onDragStart(e, d)}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      className={`bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 group cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-indigo-200 ${dragId === d.id ? 'opacity-40 scale-95' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-900 leading-tight flex-1 pr-1">{d.title}</p>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(d)} className="p-1 hover:bg-indigo-50 rounded text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={11} /></button>
                          <button onClick={() => del(d.id)} className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{d.company}{d.contact ? ` · ${d.contact}` : ''}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{fmt(d.value)}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.bg} ${m.text}`}>{d.probability}%</span>
                      </div>
                      <ProbabilityBar value={d.probability} />
                      {d.expectedClose && (
                        <p className="text-[10px] text-slate-400 mt-2">Close: {d.expectedClose}</p>
                      )}
                      {d.assignedTo && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                            {d.assignedTo[0]?.toUpperCase()}
                          </div>
                          <span className="text-[10px] text-slate-400">{d.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {stageDeals.length === 0 && !isOver && (
                    <div className="text-center py-8 text-slate-300 text-xs">Drop here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Probability</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Close Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {deals.map(d => {
                const m = STAGE_META[d.stage];
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-900">{d.title}</td>
                    <td className="px-4 py-3 text-slate-500">{d.company}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{d.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{fmt(d.value)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${d.probability >= 70 ? 'bg-emerald-500' : d.probability >= 40 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${d.probability}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{d.probability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.expectedClose || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.assignedTo || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => del(d.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {deals.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No deals yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Deal' : 'Add Deal'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Deal Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <Input label="Contact Name" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          <Input label="Deal Value ($)" type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
          <Select label="Stage" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Deal['stage'] })} options={STAGES.map(v => ({ value: v, label: v }))} />
          <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} />
          <Input label="Expected Close" type="date" value={form.expectedClose} onChange={e => setForm({ ...form, expectedClose: e.target.value })} />
          <div className="col-span-2"><Input label="Assigned To" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} /></div>
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? 'Update' : 'Add'} Deal</Button>
        </div>
      </Modal>
    </div>
  );
}
