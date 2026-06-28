import { useState } from 'react';
import { Plus, CheckCircle, XCircle, Trash2, Vote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../../components/UI/PageHeader';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { getPolls, savePolls } from '../../store/storage';
import { useAuth } from '../../contexts/AuthContext';
import type { Poll } from '../../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Polls() {
  const { currentUser } = useAuth();
  const [polls, setPolls] = useState<Poll[]>(getPolls);
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [department, setDepartment] = useState('All');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [activeTab, setActiveTab] = useState<'Active' | 'Closed'>('Active');

  const save = (updated: Poll[]) => { savePolls(updated); setPolls(updated); };

  const openModal = () => {
    setQuestion(''); setOptions(['', '']); setDepartment('All');
    setAllowMultiple(false); setEndsAt(''); setShowModal(true);
  };

  const addOption = () => setOptions(o => [...o, '']);
  const removeOption = (i: number) => setOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i: number, v: string) => setOptions(o => o.map((opt, idx) => idx === i ? v : opt));

  const createPoll = () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    const poll: Poll = {
      id: Date.now().toString(),
      question: question.trim(),
      options: validOptions.map((text, i) => ({ id: `opt-${Date.now()}-${i}`, text, votes: [] })),
      createdBy: currentUser?.name || '',
      createdAt: new Date().toISOString(),
      endsAt: endsAt || undefined,
      status: 'Active',
      allowMultiple,
      department,
    };
    save([poll, ...polls]);
    setShowModal(false);
  };

  const vote = (pollId: string, optionId: string) => {
    const uid = currentUser?.id || '';
    save(polls.map(p => {
      if (p.id !== pollId || p.status !== 'Active') return p;
      const alreadyVoted = p.options.some(o => o.votes.includes(uid));
      if (alreadyVoted && !p.allowMultiple) return p;
      return {
        ...p,
        options: p.options.map(o => {
          if (o.id !== optionId) return o;
          const voted = o.votes.includes(uid);
          return { ...o, votes: voted ? o.votes.filter(v => v !== uid) : [...o.votes, uid] };
        }),
      };
    }));
  };

  const closePoll = (id: string) => save(polls.map(p => p.id === id ? { ...p, status: 'Closed' } : p));
  const deletePoll = (id: string) => save(polls.filter(p => p.id !== id));

  const canManage = currentUser?.role !== 'Employee';
  const filtered = polls.filter(p => p.status === activeTab);

  return (
    <div>
      <PageHeader title="Polls & Surveys" subtitle="Gather team feedback and insights" action={canManage ? <Button onClick={openModal}><Plus size={16} /> New Poll</Button> : undefined} />

      <div className="flex gap-2 mb-6">
        {(['Active', 'Closed'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            {tab} ({polls.filter(p => p.status === tab).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Vote size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {activeTab.toLowerCase()} polls</p>
          {canManage && <p className="text-sm mt-1">Create a poll to gather team feedback</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(poll => {
            const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);
            const uid = currentUser?.id || '';
            const userVoted = poll.options.some(o => o.votes.includes(uid));
            const chartData = poll.options.map(o => ({ name: o.text, votes: o.votes.length }));

            return (
              <div key={poll.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${poll.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{poll.status}</span>
                      {poll.department !== 'All' && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{poll.department}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{poll.question}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">By {poll.createdBy} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1 ml-2">
                      {poll.status === 'Active' && (
                        <button onClick={() => closePoll(poll.id)} title="Close poll" className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"><XCircle size={15} /></button>
                      )}
                      <button onClick={() => deletePoll(poll.id)} title="Delete poll" className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>

                {/* Vote options */}
                {poll.status === 'Active' && !userVoted && (
                  <div className="flex flex-col gap-2 mb-4">
                    {poll.options.map(opt => (
                      <button key={opt.id} onClick={() => vote(poll.id, opt.id)}
                        className="text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results chart */}
                {(poll.status === 'Closed' || userVoted) && (
                  <>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip />
                        <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {userVoted && poll.status === 'Active' && (
                      <p className="text-xs text-indigo-600 flex items-center gap-1 mt-2"><CheckCircle size={12} /> You voted</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Poll">
        <div className="flex flex-col gap-4">
          <Input label="Question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="What do you want to ask your team?" />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Options</label>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt} onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100" />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-slate-400 hover:text-rose-500"><XCircle size={16} /></button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button onClick={addOption} className="text-xs text-indigo-600 hover:text-indigo-700 text-left mt-1 flex items-center gap-1"><Plus size={12} /> Add option</button>
              )}
            </div>
          </div>

          <Select label="Department" value={department} onChange={e => setDepartment(e.target.value)}
            options={['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'].map(d => ({ value: d, label: d }))} />

          <Input label="Ends At (optional)" type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} />

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={allowMultiple} onChange={e => setAllowMultiple(e.target.checked)} className="rounded" />
            Allow multiple choices
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={createPoll} disabled={!question.trim() || options.filter(o => o.trim()).length < 2}>Create Poll</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
