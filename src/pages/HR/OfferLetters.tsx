import { useState } from 'react';
import { Plus, Eye, X } from 'lucide-react';
import type { OfferLetter } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const STATUS_COLORS: Record<OfferLetter['status'], string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Declined: 'bg-red-100 text-red-700',
};

const emptyForm = () => ({ candidateName: '', position: '', department: '', salary: 0, startDate: '', status: 'Draft' as OfferLetter['status'] });

export function OfferLetters() {
  const [letters, setLetters] = useState<OfferLetter[]>(() => loadHRData().offerLetters);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<OfferLetter | null>(null);
  const [form, setForm] = useState(emptyForm());

  const save = () => {
    const data = loadHRData();
    const ol: OfferLetter = { id: generateId(), ...form, createdAt: now() };
    data.offerLetters = [ol, ...data.offerLetters];
    saveHRData(data);
    setLetters(data.offerLetters);
    setShowModal(false);
    setForm(emptyForm());
  };

  const updateStatus = (id: string, status: OfferLetter['status']) => {
    const data = loadHRData();
    data.offerLetters = data.offerLetters.map(l => l.id === id ? { ...l, status } : l);
    saveHRData(data);
    setLetters(data.offerLetters);
  };

  const del = (id: string) => {
    const data = loadHRData();
    data.offerLetters = data.offerLetters.filter(l => l.id !== id);
    saveHRData(data);
    setLetters(data.offerLetters);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Offer Letters</h2>
          <p className="text-sm text-gray-500">{letters.length} offer letters</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Create Offer Letter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Candidate', 'Position', 'Department', 'Salary', 'Start Date', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {letters.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{l.candidateName}</td>
                <td className="px-4 py-3 text-gray-600">{l.position}</td>
                <td className="px-4 py-3 text-gray-600">{l.department}</td>
                <td className="px-4 py-3 text-gray-600">${l.salary.toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-gray-600">{l.startDate}</td>
                <td className="px-4 py-3">
                  <select
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[l.status]}`}
                    value={l.status}
                    onChange={e => updateStatus(l.id, e.target.value as OfferLetter['status'])}
                  >
                    {(['Draft', 'Sent', 'Accepted', 'Declined'] as OfferLetter['status'][]).map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setPreview(l)} className="p-1 text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                    <button onClick={() => del(l.id)} className="p-1 text-gray-400 hover:text-red-600"><X size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {letters.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No offer letters yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Create Offer Letter</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {(['candidateName', 'position', 'department'] as const).map(f => (
                <div key={f} className={f === 'candidateName' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Salary ($/year)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Offer Letter Preview</h3>
              <button onClick={() => setPreview(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-8">
              <div className="border border-gray-200 rounded-xl p-8 font-serif">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">CRM Pro Inc.</h1>
                  <p className="text-gray-500 text-sm mt-1">123 Business Avenue, Suite 100 · contact@crmpro.com</p>
                </div>
                <p className="text-gray-600 text-sm mb-6">{new Date(preview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-semibold text-gray-800 mb-1">Dear {preview.candidateName},</p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We are pleased to offer you the position of <strong>{preview.position}</strong> in the <strong>{preview.department}</strong> department at CRM Pro Inc.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Your starting annual salary will be <strong>${preview.salary.toLocaleString()}</strong>, paid on a bi-weekly basis. Your anticipated start date is <strong>{preview.startDate}</strong>.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You will be entitled to <strong>22 days</strong> of paid leave per year, in addition to all public holidays. A comprehensive benefits package including health insurance and retirement plan will be provided.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  This offer is contingent upon successful completion of a background check. Please sign and return this letter by the date indicated above to confirm your acceptance.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">We look forward to welcoming you to the team.</p>
                <div className="mt-10 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Authorized Signature</p>
                    <div className="border-b border-gray-400 w-48 mt-8 mb-1" />
                    <p className="text-xs text-gray-500">HR Manager, CRM Pro Inc.</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Candidate Acceptance</p>
                    <div className="border-b border-gray-400 w-48 mt-8 mb-1" />
                    <p className="text-xs text-gray-500">{preview.candidateName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
