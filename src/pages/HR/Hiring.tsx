import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { HiringCandidate } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const STAGES: HiringCandidate['stage'][] = ['Applied', 'Interview', 'Offer', 'Hired', 'Rejected'];

const STAGE_COLORS: Record<HiringCandidate['stage'], string> = {
  Applied: 'bg-gray-100 border-gray-300',
  Interview: 'bg-blue-50 border-blue-200',
  Offer: 'bg-yellow-50 border-yellow-200',
  Hired: 'bg-green-50 border-green-200',
  Rejected: 'bg-red-50 border-red-200',
};

const BADGE_COLORS: Record<HiringCandidate['stage'], string> = {
  Applied: 'bg-gray-200 text-gray-700',
  Interview: 'bg-blue-100 text-blue-700',
  Offer: 'bg-yellow-100 text-yellow-700',
  Hired: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const emptyForm = () => ({ name: '', email: '', phone: '', position: '', stage: 'Applied' as HiringCandidate['stage'], notes: '', appliedDate: new Date().toISOString().split('T')[0] });

export function Hiring() {
  const [candidates, setCandidates] = useState<HiringCandidate[]>(() => loadHRData().hiringCandidates);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const save = () => {
    const data = loadHRData();
    const c: HiringCandidate = { id: generateId(), ...form, createdAt: now() };
    data.hiringCandidates = [c, ...data.hiringCandidates];
    saveHRData(data);
    setCandidates(data.hiringCandidates);
    setShowModal(false);
    setForm(emptyForm());
  };

  const moveStage = (id: string, stage: HiringCandidate['stage']) => {
    const data = loadHRData();
    data.hiringCandidates = data.hiringCandidates.map(c => c.id === id ? { ...c, stage } : c);
    saveHRData(data);
    setCandidates(data.hiringCandidates);
  };

  const del = (id: string) => {
    const data = loadHRData();
    data.hiringCandidates = data.hiringCandidates.filter(c => c.id !== id);
    saveHRData(data);
    setCandidates(data.hiringCandidates);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Hiring Pipeline</h2>
          <p className="text-sm text-gray-500">{candidates.length} candidates total</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const cols = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_COLORS[stage]}`}>{stage}</span>
                <span className="text-xs text-gray-400 font-medium">{cols.length}</span>
              </div>
              <div className="space-y-3">
                {cols.map(c => (
                  <div key={c.id} className={`rounded-xl border p-3 ${STAGE_COLORS[stage]}`}>
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                      <button onClick={() => del(c.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                    </div>
                    <p className="text-xs text-blue-600 mt-0.5">{c.position}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.email}</p>
                    {c.notes && <p className="text-xs text-gray-400 mt-2 italic">"{c.notes}"</p>}
                    <div className="mt-3">
                      <select
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={c.stage}
                        onChange={e => moveStage(c.id, e.target.value as HiringCandidate['stage'])}
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {cols.length === 0 && <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">No candidates</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Add Candidate</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {(['name', 'email', 'phone', 'position'] as const).map(f => (
                <div key={f}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as HiringCandidate['stage'] })}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
