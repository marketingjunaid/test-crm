import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, CalendarDays, List } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Textarea } from '../components/UI/Textarea';
import { getCalendarEvents, saveCalendarEvents } from '../store/storage';
import { useAuth } from '../contexts/AuthContext';
import type { CalendarEvent } from '../types';

const TYPE_META: Record<CalendarEvent['type'], { bg: string; text: string; dot: string; label: string }> = {
  holiday:  { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'Holiday' },
  leave:    { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Leave' },
  deadline: { bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-500',  label: 'Deadline' },
  event:    { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    label: 'Event' },
  meeting:  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Meeting' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EVENT_TYPES: CalendarEvent['type'][] = ['holiday', 'leave', 'deadline', 'event', 'meeting'];

const empty = (): Omit<CalendarEvent, 'id' | 'createdBy'> => ({
  title: '', date: '', endDate: '', time: '', endTime: '',
  type: 'event', description: '', allDay: true,
});

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(getCalendarEvents());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(empty());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<CalendarEvent['type'] | 'all'>('all');

  const persist = (updated: CalendarEvent[]) => { saveCalendarEvents(updated); setEvents(updated); };

  const save = () => {
    if (!form.title || !form.date) return;
    const updated = editing
      ? events.map(e => e.id === editing.id ? { ...editing, ...form } : e)
      : [...events, { ...form, id: crypto.randomUUID(), createdBy: currentUser?.name || '' }];
    persist(updated); setModal(false); setEditing(null); setForm(empty());
  };

  const del = (id: string) => { if (!confirm('Delete event?')) return; persist(events.filter(e => e.id !== id)); };

  const openEdit = (ev: CalendarEvent) => {
    setEditing(ev);
    setForm({ title: ev.title, date: ev.date, endDate: ev.endDate || '', time: ev.time || '', endTime: ev.endTime || '', type: ev.type, description: ev.description || '', allDay: ev.allDay });
    setModal(true);
  };

  const openNew = (date?: string) => {
    setEditing(null);
    setForm({ ...empty(), date: date || '' });
    setModal(true);
  };

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = useMemo(() => {
    const c: { date: string; day: number; currentMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const prevMonth = month === 0 ? year - 1 : year;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      c.push({ date: `${prevMonth}-${String(prevMonthIdx + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, currentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      c.push({ date: `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, currentMonth: true });
    }
    const remaining = 42 - c.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? year + 1 : year;
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      c.push({ date: `${nextMonth}-${String(nextMonthIdx + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, currentMonth: false });
    }
    return c;
  }, [year, month, firstDay, daysInMonth, daysInPrev]);

  const eventsOnDate = (date: string) =>
    events.filter(e => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (!e.endDate || e.endDate === e.date) return e.date === date;
      return date >= e.date && date <= e.endDate;
    });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const listEvents = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return events
      .filter(e => e.date.startsWith(monthStr) && (filterType === 'all' || e.type === filterType))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, year, month, filterType]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dayEvents = selectedDay ? eventsOnDate(selectedDay) : [];

  return (
    <div>
      <PageHeader
        title="Company Calendar"
        subtitle="Holidays, leaves, deadlines and events"
        action={
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('month')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <CalendarDays size={13} /> Month
              </button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <List size={13} /> List
              </button>
            </div>
            {isAdmin && <Button onClick={() => openNew()}><Plus size={15} /> Add Event</Button>}
          </div>
        }
      />

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
        {EVENT_TYPES.map(t => {
          const m = TYPE_META[t];
          return (
            <button key={t} onClick={() => setFilterType(filterType === t ? 'all' : t)} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${filterType === t ? `${m.bg} ${m.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}
            </button>
          );
        })}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
          <h2 className="text-lg font-bold text-slate-900 min-w-[200px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
        </div>
        <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors">Today</button>
      </div>

      {view === 'month' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const evs = eventsOnDate(cell.date);
              const isToday = cell.date === todayStr;
              const isSelected = cell.date === selectedDay;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(cell.date === selectedDay ? null : cell.date)}
                  className={`min-h-[90px] p-1.5 border-b border-r border-slate-50 cursor-pointer transition-colors
                    ${!cell.currentMonth ? 'bg-slate-50/50' : 'hover:bg-slate-50'}
                    ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' : ''}`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mb-1 font-medium transition-colors
                    ${isToday ? 'bg-indigo-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                    {cell.day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {evs.slice(0, 3).map(ev => {
                      const m = TYPE_META[ev.type];
                      return (
                        <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${m.bg} ${m.text}`}>
                          {ev.title}
                        </div>
                      );
                    })}
                    {evs.length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{evs.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected day panel */}
      {view === 'month' && selectedDay && (
        <div className="mt-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            {isAdmin && (
              <button onClick={() => openNew(selectedDay)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                <Plus size={12} /> Add event
              </button>
            )}
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-slate-400">No events on this day</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dayEvents.map(ev => {
                const m = TYPE_META[ev.type];
                return (
                  <div key={ev.id} className={`flex items-start justify-between p-3 rounded-lg ${m.bg}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${m.text}`}>{m.label}</span>
                        {!ev.allDay && ev.time && <span className={`text-xs ${m.text} opacity-75`}>{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>}
                      </div>
                      <p className={`text-sm font-semibold ${m.text}`}>{ev.title}</p>
                      {ev.description && <p className={`text-xs mt-0.5 ${m.text} opacity-75`}>{ev.description}</p>}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 ml-3 flex-shrink-0">
                        <button onClick={() => openEdit(ev)} className="p-1 hover:bg-white/50 rounded transition-colors"><Pencil size={12} className={m.text} /></button>
                        <button onClick={() => del(ev.id)} className="p-1 hover:bg-white/50 rounded transition-colors"><Trash2 size={12} className={m.text} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {listEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              <p>No events in {MONTHS[month]}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {listEvents.map(ev => {
                const m = TYPE_META[ev.type];
                return (
                  <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                    <div className="text-center w-10 flex-shrink-0">
                      <p className="text-xs text-slate-400 font-medium">{MONTHS[parseInt(ev.date.split('-')[1]) - 1].slice(0, 3)}</p>
                      <p className="text-xl font-bold text-slate-900 leading-none">{parseInt(ev.date.split('-')[2])}</p>
                    </div>
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${m.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{ev.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>{m.label}</span>
                      </div>
                      {ev.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.description}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ev.allDay ? 'All day' : ev.time}
                        {ev.endDate && ev.endDate !== ev.date ? ` → ${ev.endDate}` : ''}
                        {ev.createdBy ? ` · Added by ${ev.createdBy}` : ''}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(ev)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Pencil size={13} className="text-slate-400" /></button>
                        <button onClick={() => del(ev.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={13} className="text-rose-400" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Event' : 'Add Event'}>
        <div className="flex flex-col gap-4">
          <Input label="Event Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Select
            label="Type"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as CalendarEvent['type'] })}
            options={EVENT_TYPES.map(t => ({ value: t, label: TYPE_META[t].label }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <Input label="End Date (optional)" type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />
              <span className="text-sm text-slate-700">All day</span>
            </label>
          </div>
          {!form.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Time" type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })} />
              <Input label="End Time" type="time" value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          )}
          <Textarea label="Description (optional)" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? 'Update' : 'Add'} Event</Button>
        </div>
      </Modal>
    </div>
  );
}
