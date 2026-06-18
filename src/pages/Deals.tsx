import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Modal } from '../components/UI/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Deal, DealStage } from '../types';

const STAGES: DealStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const stageColors: Record<DealStage, string> = {
  Prospecting: 'bg-gray-100 border-gray-300',
  Qualification: 'bg-blue-50 border-blue-200',
  Proposal: 'bg-yellow-50 border-yellow-200',
  Negotiation: 'bg-orange-50 border-orange-200',
  'Closed Won': 'bg-green-50 border-green-200',
  'Closed Lost': 'bg-red-50 border-red-200',
};

const stageHeaderColors: Record<DealStage, string> = {
  Prospecting: 'bg-gray-200 text-gray-700',
  Qualification: 'bg-blue-200 text-blue-800',
  Proposal: 'bg-yellow-200 text-yellow-800',
  Negotiation: 'bg-orange-200 text-orange-800',
  'Closed Won': 'bg-green-200 text-green-800',
  'Closed Lost': 'bg-red-200 text-red-800',
};

const empty: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', value: 0, stage: 'Prospecting', company: '', contact: '', closeDate: '', probability: 20,
};

export function Deals() {
  const { data, addDeal, updateDeal, deleteDeal } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(empty);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (d: Deal) => {
    setForm({ title: d.title, value: d.value, stage: d.stage, company: d.company, contact: d.contact, closeDate: d.closeDate, probability: d.probability });
    setEditing(d); setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    editing ? updateDeal(editing.id, form) : addDeal(form);
    setShowModal(false);
  };

  const moveStage = (deal: Deal, dir: 1 | -1) => {
    const idx = STAGES.indexOf(deal.stage);
    const next = STAGES[idx + dir];
    if (next) updateDeal(deal.id, { stage: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.deals.length} deals &middot; ${data.deals.reduce((s, d) => s + d.value, 0).toLocaleString()} total value
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Deal
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const deals = data.deals.filter(d => d.stage === stage);
          const stageValue = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} className="flex-shrink-0 w-60">
              <div className={`rounded-lg px-3 py-2 mb-2 ${stageHeaderColors[stage]}`}>
                <div className="font-semibold text-sm">{stage}</div>
                <div className="text-xs mt-0.5 opacity-80">{deals.length} deals &middot; ${stageValue.toLocaleString()}</div>
              </div>
              <div className={`rounded-lg border-2 ${stageColors[stage]} min-h-32 p-2 space-y-2`}>
                {deals.map(deal => (
                  <div key={deal.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <div className="font-medium text-sm text-gray-900 mb-1">{deal.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{deal.company}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-700">${deal.value.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">{deal.probability}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1 mb-2">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${deal.probability}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button onClick={() => moveStage(deal, -1)} disabled={STAGES.indexOf(deal.stage) === 0} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30">&larr;</button>
                        <button onClick={() => moveStage(deal, 1)} disabled={STAGES.indexOf(deal.stage) === STAGES.length - 1} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30">&rarr;</button>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(deal)} className="p-1 hover:bg-blue-50 rounded text-blue-600"><Pencil size={12} /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteDeal(deal.id); }} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Deal' : 'Add Deal'} onClose={() => setShowModal(false)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as DealStage }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
              <input type="date" value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
