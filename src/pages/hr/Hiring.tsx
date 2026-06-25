import { useState } from 'react';
import { getJobs, saveJobs, getCandidates, saveCandidates } from '../../store/storage';
import { HiringJob, HiringCandidate } from '../../types';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import Modal from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import EmptyState from '../../components/UI/EmptyState';
import { Plus, Briefcase, Users, ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react';

export default function Hiring() {
  const [jobs, setJobs] = useState<HiringJob[]>(getJobs());
  const [candidates, setCandidates] = useState<HiringCandidate[]>(getCandidates());
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandModal, setShowCandModal] = useState(false);
  const [editJob, setEditJob] = useState<HiringJob | null>(null);
  const [editCand, setEditCand] = useState<HiringCandidate | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');

  const [jobForm, setJobForm] = useState({ title: '', department: '', description: '', requirements: '', status: 'Open' as HiringJob['status'] });
  const [candForm, setCandForm] = useState({ name: '', email: '', phone: '', stage: 'Applied' as HiringCandidate['stage'], notes: '' });

  const openJobModal = (job?: HiringJob) => {
    if (job) { setEditJob(job); setJobForm({ title: job.title, department: job.department, description: job.description, requirements: job.requirements, status: job.status }); }
    else { setEditJob(null); setJobForm({ title: '', department: '', description: '', requirements: '', status: 'Open' }); }
    setShowJobModal(true);
  };

  const saveJob = () => {
    let updated: HiringJob[];
    if (editJob) {
      updated = jobs.map(j => j.id === editJob.id ? { ...j, ...jobForm } : j);
    } else {
      const newJob: HiringJob = { id: crypto.randomUUID(), ...jobForm, createdAt: new Date().toISOString().split('T')[0] };
      updated = [...jobs, newJob];
    }
    saveJobs(updated); setJobs(updated); setShowJobModal(false);
  };

  const deleteJob = (id: string) => { const u = jobs.filter(j => j.id !== id); saveJobs(u); setJobs(u); };

  const openCandModal = (jobId: string, jobTitle: string, cand?: HiringCandidate) => {
    setSelectedJobId(jobId); setSelectedJobTitle(jobTitle);
    if (cand) { setEditCand(cand); setCandForm({ name: cand.name, email: cand.email, phone: cand.phone, stage: cand.stage, notes: cand.notes || '' }); }
    else { setEditCand(null); setCandForm({ name: '', email: '', phone: '', stage: 'Applied', notes: '' }); }
    setShowCandModal(true);
  };

  const saveCand = () => {
    let updated: HiringCandidate[];
    if (editCand) {
      updated = candidates.map(c => c.id === editCand.id ? { ...c, ...candForm } : c);
    } else {
      const newCand: HiringCandidate = { id: crypto.randomUUID(), jobId: selectedJobId, jobTitle: selectedJobTitle, ...candForm, appliedDate: new Date().toISOString().split('T')[0] };
      updated = [...candidates, newCand];
    }
    saveCandidates(updated); setCandidates(updated); setShowCandModal(false);
  };

  const deleteCand = (id: string) => { const u = candidates.filter(c => c.id !== id); saveCandidates(u); setCandidates(u); };

  const stages: HiringCandidate['stage'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  return (
    <div>
      <PageHeader title="Hiring" subtitle="Manage job postings and candidates" action={<Button onClick={() => openJobModal()}><Plus size={16} className="mr-1" />Post Job</Button>} />
      {jobs.length === 0 ? <EmptyState message="No job postings yet" action={<Button onClick={() => openJobModal()}>Post First Job</Button>} /> : (
        <div className="space-y-4">
          {jobs.map(job => {
            const jobCandidates = candidates.filter(c => c.jobId === job.id);
            const isExpanded = expandedJob === job.id;
            return (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Briefcase size={20} className="text-indigo-600" /></div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge status={job.status} />
                    <div className="flex items-center gap-1 text-sm text-slate-500"><Users size={14} />{jobCandidates.length}</div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); openJobModal(job); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteJob(job.id); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5">
                    <p className="text-sm text-slate-600 mb-4">{job.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-800">Candidates ({jobCandidates.length})</h4>
                      <Button size="sm" onClick={() => openCandModal(job.id, job.title)}><Plus size={14} className="mr-1" />Add Candidate</Button>
                    </div>
                    {jobCandidates.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">No candidates yet</p> : (
                      <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50"><th className="text-left px-3 py-2 font-medium text-slate-600">Name</th><th className="text-left px-3 py-2 font-medium text-slate-600">Email</th><th className="text-left px-3 py-2 font-medium text-slate-600">Stage</th><th className="text-left px-3 py-2 font-medium text-slate-600">Applied</th><th className="px-3 py-2"></th></tr></thead>
                        <tbody>{jobCandidates.map(c => (
                          <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium text-slate-900">{c.name}</td>
                            <td className="px-3 py-2 text-slate-500">{c.email}</td>
                            <td className="px-3 py-2"><Badge status={c.stage} /></td>
                            <td className="px-3 py-2 text-slate-500">{c.appliedDate}</td>
                            <td className="px-3 py-2 flex gap-2">
                              <button onClick={() => openCandModal(job.id, job.title, c)} className="p-1 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                              <button onClick={() => deleteCand(c.id)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title={editJob ? 'Edit Job' : 'Post New Job'} size="lg">
        <div className="space-y-3">
          <Input label="Job Title" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} />
          <Input label="Department" value={jobForm.department} onChange={e => setJobForm(p => ({ ...p, department: e.target.value }))} />
          <Select label="Status" value={jobForm.status} onChange={e => setJobForm(p => ({ ...p, status: e.target.value as HiringJob['status'] }))} options={['Open','Closed'].map(v => ({ value: v, label: v }))} />
          <Textarea label="Description" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={3} />
          <Textarea label="Requirements" value={jobForm.requirements} onChange={e => setJobForm(p => ({ ...p, requirements: e.target.value }))} rows={3} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowJobModal(false)}>Cancel</Button><Button onClick={saveJob}>Save</Button></div>
      </Modal>

      <Modal isOpen={showCandModal} onClose={() => setShowCandModal(false)} title={editCand ? 'Edit Candidate' : 'Add Candidate'}>
        <div className="space-y-3">
          <Input label="Full Name" value={candForm.name} onChange={e => setCandForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" value={candForm.email} onChange={e => setCandForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Phone" value={candForm.phone} onChange={e => setCandForm(p => ({ ...p, phone: e.target.value }))} />
          <Select label="Stage" value={candForm.stage} onChange={e => setCandForm(p => ({ ...p, stage: e.target.value as HiringCandidate['stage'] }))} options={stages.map(v => ({ value: v, label: v }))} />
          <Textarea label="Notes" value={candForm.notes} onChange={e => setCandForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
        </div>
        <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={() => setShowCandModal(false)}>Cancel</Button><Button onClick={saveCand}>Save</Button></div>
      </Modal>
    </div>
  );
}
