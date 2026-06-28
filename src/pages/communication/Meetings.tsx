import { useState } from 'react';
import { Plus, Video, Calendar, Clock, Users, ExternalLink, Trash2, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { getMeetings, saveMeetings, getUsers } from '../../store/storage';
import { useAuth } from '../../contexts/AuthContext';
import type { Meeting } from '../../types';

const PLATFORM_COLORS: Record<string, string> = {
  'Google Meet': 'bg-emerald-100 text-emerald-700',
  'Zoom': 'bg-blue-100 text-blue-700',
  'Teams': 'bg-violet-100 text-violet-700',
  'Other': 'bg-slate-100 text-slate-600',
};

const PLATFORM_ICONS: Record<string, string> = {
  'Google Meet': '🟢',
  'Zoom': '🔵',
  'Teams': '🟣',
  'Other': '📹',
};

const empty = (): Omit<Meeting, 'id' | 'createdAt' | 'createdBy'> => ({
  title: '', description: '', date: '', time: '', duration: 30,
  attendees: [], videoLink: '', platform: 'Google Meet', status: 'Scheduled',
});

export default function Meetings() {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>(getMeetings);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty());
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const users = getUsers();

  const save = (updated: Meeting[]) => { saveMeetings(updated); setMeetings(updated); };

  const openCreate = () => { setForm(empty()); setEditing(null); setAttendeeInput(''); setShowModal(true); };
  const openEdit = (m: Meeting) => { setForm({ ...m }); setEditing(m); setAttendeeInput(''); setShowModal(true); };

  const addAttendee = () => {
    const val = attendeeInput.trim();
    if (val && !form.attendees.includes(val)) {
      setForm(f => ({ ...f, attendees: [...f.attendees, val] }));
      setAttendeeInput('');
    }
  };

  const removeAttendee = (a: string) => setForm(f => ({ ...f, attendees: f.attendees.filter(x => x !== a) }));

  const submit = () => {
    if (!form.title.trim() || !form.date || !form.time) return;
    if (editing) {
      save(meetings.map(m => m.id === editing.id ? { ...editing, ...form } : m));
    } else {
      const meeting: Meeting = {
        ...form,
        id: Date.now().toString(),
        createdBy: currentUser?.name || '',
        createdAt: new Date().toISOString(),
      };
      save([meeting, ...meetings]);
    }
    setShowModal(false);
  };

  const updateStatus = (id: string, status: Meeting['status']) => save(meetings.map(m => m.id === id ? { ...m, status } : m));
  const deleteMeeting = (id: string) => save(meetings.filter(m => m.id !== id));

  const now = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter(m => m.date >= now && m.status === 'Scheduled').sort((a, b) => a.date.localeCompare(b.date));
  const past = meetings.filter(m => m.date < now || m.status !== 'Scheduled').sort((a, b) => b.date.localeCompare(a.date));
  const displayed = activeTab === 'upcoming' ? upcoming : past;

  const canManage = currentUser?.role !== 'Employee';

  return (
    <div>
      <PageHeader title="Meetings" subtitle="Schedule and manage video meetings" action={<Button onClick={openCreate}><Plus size={16} /> Schedule Meeting</Button>} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{upcoming.length}</p>
          <p className="text-xs text-slate-500 mt-1">Upcoming</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{meetings.filter(m => m.status === 'Completed').length}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-slate-600">{meetings.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {(['upcoming', 'past'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            {tab} ({(tab === 'upcoming' ? upcoming : past).length})
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Video size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {activeTab} meetings</p>
          <p className="text-sm mt-1">Schedule a meeting to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map(m => (
            <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base">{PLATFORM_ICONS[m.platform]}</span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{m.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLATFORM_COLORS[m.platform]}`}>{m.platform}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      m.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                      m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>{m.status}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={12} />{m.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{m.time} · {m.duration} min</span>
                    {m.attendees.length > 0 && (
                      <span className="flex items-center gap-1"><Users size={12} />{m.attendees.length} attendee{m.attendees.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>

                  {m.description && <p className="text-xs text-slate-500 mt-2">{m.description}</p>}

                  {m.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.attendees.map(a => (
                        <span key={a} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  {m.videoLink && (
                    <a href={m.videoLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      <ExternalLink size={12} /> Join
                    </a>
                  )}
                  {canManage && m.status === 'Scheduled' && (
                    <>
                      <button onClick={() => updateStatus(m.id, 'Completed')} title="Mark complete" className="p-1.5 text-slate-400 hover:text-emerald-600"><CheckCircle size={15} /></button>
                      <button onClick={() => updateStatus(m.id, 'Cancelled')} title="Cancel" className="p-1.5 text-slate-400 hover:text-amber-600"><XCircle size={15} /></button>
                    </>
                  )}
                  <button onClick={() => openEdit(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 text-xs">Edit</button>
                  {canManage && (
                    <button onClick={() => deleteMeeting(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Meeting' : 'Schedule Meeting'}>
        <div className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Team standup, Sprint review..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Duration" value={form.duration.toString()} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              options={[15, 30, 45, 60, 90, 120].map(d => ({ value: d.toString(), label: `${d} minutes` }))} />
            <Select label="Platform" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Meeting['platform'] }))}
              options={['Google Meet', 'Zoom', 'Teams', 'Other'].map(p => ({ value: p, label: p }))} />
          </div>
          <Input label="Video Link (optional)" value={form.videoLink || ''} onChange={e => setForm(f => ({ ...f, videoLink: e.target.value }))} placeholder="https://meet.google.com/..." />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Attendees</label>
            <div className="flex gap-2 mb-2">
              <select value={attendeeInput} onChange={e => setAttendeeInput(e.target.value)}
                className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100">
                <option value="">Select team member...</option>
                {users.filter(u => !form.attendees.includes(u.name)).map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
              <Button onClick={addAttendee} disabled={!attendeeInput}>Add</Button>
            </div>
            {form.attendees.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.attendees.map(a => (
                  <span key={a} className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                    {a}
                    <button onClick={() => removeAttendee(a)} className="hover:text-rose-500"><XCircle size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="Agenda, notes..."
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.title.trim() || !form.date || !form.time}>{editing ? 'Save' : 'Schedule'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
