import { useState, useRef } from 'react';
import { Upload, Trash2, Download, X } from 'lucide-react';
import type { HRDocument } from '../../types';
import { loadHRData, saveHRData, generateId, now } from '../../store/storage';

const DOC_TYPES: HRDocument['type'][] = ['Offer Letter', 'ID Proof', 'Contract', 'NDA', 'Other'];

export function Documents() {
  const [docs, setDocs] = useState<HRDocument[]>(() => loadHRData().documents);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', employeeName: '', name: '', type: 'Contract' as HRDocument['type'] });
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const employees = loadHRData().employees;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setFileData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    const emp = employees.find(e => e.id === form.employeeId);
    const doc: HRDocument = { id: generateId(), ...form, employeeName: emp?.name ?? form.employeeName, fileData, fileName, uploadedAt: now() };
    const data = loadHRData();
    data.documents = [doc, ...data.documents];
    saveHRData(data);
    setDocs(data.documents);
    setShowModal(false);
    setForm({ employeeId: '', employeeName: '', name: '', type: 'Contract' });
    setFileData('');
    setFileName('');
  };

  const del = (id: string) => {
    const data = loadHRData();
    data.documents = data.documents.filter(d => d.id !== id);
    saveHRData(data);
    setDocs(data.documents);
  };

  const download = (doc: HRDocument) => {
    if (!doc.fileData) return;
    const a = document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
          <p className="text-sm text-gray-500">{docs.length} documents</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Document Name', 'Employee', 'Type', 'Uploaded', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{doc.name}</td>
                <td className="px-4 py-3 text-gray-600">{doc.employeeName}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{doc.type}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    {doc.fileData && <button onClick={() => download(doc)} className="p-1 text-gray-400 hover:text-blue-600"><Download size={15} /></button>}
                    <button onClick={() => del(doc.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No documents yet. Upload one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Upload Document</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Name</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as HRDocument['type'] })}>
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File</label>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  {fileName ? <p className="text-sm text-gray-700">{fileName}</p> : <p className="text-sm text-gray-400">Click to select a file</p>}
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!form.name || !form.employeeId} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
