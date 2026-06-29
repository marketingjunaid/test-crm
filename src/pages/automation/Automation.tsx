import { useState, useEffect } from 'react';
import { Plus, Zap, Play, Trash2, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import Modal from '../../components/UI/Modal';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { getAutomationRules, saveAutomationRules, getAutomationLogs } from '../../store/storage';
import { initBuiltInRules, fireTrigger } from '../../utils/automationEngine';
import type { AutomationRule, AutomationTrigger, AutomationAction, AutomationLog } from '../../types';

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  employee_added: 'Employee Added',
  leave_approved: 'Leave Approved',
  leave_rejected: 'Leave Rejected',
  deal_won: 'Deal Won',
  deal_lost: 'Deal Lost',
  deal_stage_changed: 'Deal Stage Changed',
  ticket_created: 'Ticket Created',
  ticket_resolved: 'Ticket Resolved',
  candidate_hired: 'Candidate Hired',
  invoice_overdue: 'Invoice Overdue',
  task_overdue: 'Task Overdue',
};

const ACTION_LABELS: Record<AutomationAction, string> = {
  send_notification: 'Send Notification',
  send_notification_to_manager: 'Send Notification to Manager',
  create_task: 'Create Task',
  create_announcement: 'Post Announcement',
  escalate_ticket: 'Escalate Ticket to Urgent',
};

const TRIGGER_COLOR: Record<AutomationTrigger, string> = {
  employee_added: 'bg-indigo-100 text-indigo-700',
  leave_approved: 'bg-emerald-100 text-emerald-700',
  leave_rejected: 'bg-rose-100 text-rose-700',
  deal_won: 'bg-amber-100 text-amber-700',
  deal_lost: 'bg-slate-100 text-slate-600',
  deal_stage_changed: 'bg-violet-100 text-violet-700',
  ticket_created: 'bg-blue-100 text-blue-700',
  ticket_resolved: 'bg-emerald-100 text-emerald-700',
  candidate_hired: 'bg-indigo-100 text-indigo-700',
  invoice_overdue: 'bg-rose-100 text-rose-700',
  task_overdue: 'bg-amber-100 text-amber-700',
};

const emptyRule = (): Omit<AutomationRule, 'id' | 'createdAt' | 'runCount' | 'isBuiltIn'> => ({
  name: '',
  trigger: 'employee_added',
  action: 'send_notification',
  actionPayload: { title: '', message: '' },
  conditions: [],
  enabled: true,
});

export default function Automation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyRule());
  const [editing, setEditing] = useState<AutomationRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    initBuiltInRules();
    setRules(getAutomationRules());
    setLogs(getAutomationLogs());
  }, []);

  const refresh = () => { setRules(getAutomationRules()); setLogs(getAutomationLogs()); };

  const saveRules = (updated: AutomationRule[]) => { saveAutomationRules(updated); setRules(updated); };

  const toggleEnabled = (id: string) => {
    saveRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => saveRules(rules.filter(r => r.id !== id));

  const openCreate = () => { setForm(emptyRule()); setEditing(null); setShowModal(true); };
  const openEdit = (r: AutomationRule) => {
    setForm({ name: r.name, trigger: r.trigger, action: r.action, actionPayload: { ...r.actionPayload }, conditions: [...r.conditions], enabled: r.enabled });
    setEditing(r);
    setShowModal(true);
  };

  const updatePayloadFields = (action: AutomationAction) => {
    const defaults: Record<AutomationAction, Record<string, string>> = {
      send_notification: { title: '', message: '' },
      send_notification_to_manager: { title: '', message: '' },
      create_task: { taskTitle: '', taskDescription: '', priority: 'Medium', dueDays: '3', assignedTo: '' },
      create_announcement: { title: '', content: '', department: 'All', priority: 'Normal' },
      escalate_ticket: {},
    };
    setForm(f => ({ ...f, action, actionPayload: defaults[action] }));
  };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editing) {
      saveRules(rules.map(r => r.id === editing.id ? { ...editing, ...form } : r));
    } else {
      const rule: AutomationRule = {
        ...form,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        runCount: 0,
        isBuiltIn: false,
      };
      saveRules([...rules, rule]);
    }
    setShowModal(false);
  };

  const testRule = (rule: AutomationRule) => {
    setTestingId(rule.id);
    fireTrigger(rule.trigger, { name: 'Test Employee', assignedTo: '' });
    setTimeout(() => { setTestingId(null); refresh(); }, 800);
  };

  const enabledCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((s, r) => s + r.runCount, 0);

  return (
    <div>
      <PageHeader title="Automation" subtitle="Set rules that run automatically when events happen" action={<Button onClick={openCreate}><Plus size={16} /> New Rule</Button>} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{rules.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Rules</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalRuns}</p>
          <p className="text-xs text-slate-500 mt-1">Total Runs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['rules', 'logs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
            {tab === 'rules' ? `Rules (${rules.length})` : `Run History (${logs.length})`}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="flex flex-col gap-3">
          {rules.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Zap size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No automation rules yet</p>
              <p className="text-sm mt-1">Create your first rule to automate repetitive tasks</p>
            </div>
          )}
          {rules.map(rule => (
            <div key={rule.id} className={`bg-white dark:bg-slate-800 rounded-xl border transition-all ${rule.enabled ? 'border-slate-100 dark:border-slate-700' : 'border-slate-100 dark:border-slate-700 opacity-60'}`}>
              <div className="flex items-center gap-3 p-4">
                {/* Toggle */}
                <button onClick={() => toggleEnabled(rule.id)}
                  className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${rule.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.name}</span>
                    {rule.isBuiltIn && <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 px-1.5 py-0.5 rounded font-medium">Built-in</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TRIGGER_COLOR[rule.trigger]}`}>
                      When: {TRIGGER_LABELS[rule.trigger]}
                    </span>
                    <span className="text-[10px] text-slate-400">→</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {ACTION_LABELS[rule.action]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Play size={10} />{rule.runCount} runs</span>
                    {rule.lastRun && <span className="flex items-center gap-1"><Clock size={10} />Last: {new Date(rule.lastRun).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => testRule(rule)} title="Test run"
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${testingId === rule.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                    {testingId === rule.id ? '✓ Ran' : 'Test'}
                  </button>
                  {!rule.isBuiltIn && (
                    <>
                      <button onClick={() => openEdit(rule)} className="p-1.5 text-slate-400 hover:text-indigo-600 text-xs">Edit</button>
                      <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </>
                  )}
                  <button onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)} className="p-1.5 text-slate-400 hover:text-slate-600">
                    {expandedId === rule.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === rule.id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Trigger</p>
                      <p className="text-slate-500">{TRIGGER_LABELS[rule.trigger]}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Action</p>
                      <p className="text-slate-500">{ACTION_LABELS[rule.action]}</p>
                    </div>
                    {Object.keys(rule.actionPayload).length > 0 && (
                      <div className="col-span-2">
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Action Config</p>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 flex flex-col gap-1">
                          {Object.entries(rule.actionPayload).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="text-slate-500 capitalize w-24 flex-shrink-0">{k}:</span>
                              <span className="text-slate-700 dark:text-slate-300">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {rule.conditions.length > 0 && (
                      <div className="col-span-2">
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Conditions</p>
                        {rule.conditions.map((c, i) => (
                          <span key={i} className="text-slate-500">{c.field} {c.operator === 'equals' ? '=' : '≠'} {c.value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No automation runs yet</p>
              <p className="text-sm mt-1">Test a rule or wait for a trigger to fire</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  {log.success
                    ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <XCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{log.ruleName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.detail}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-slate-400">{TRIGGER_LABELS[log.trigger as AutomationTrigger] || log.trigger}</span>
                      <span className="text-[10px] text-slate-400">→ {ACTION_LABELS[log.action as AutomationAction] || log.action}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">{new Date(log.ranAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Rule' : 'New Automation Rule'}>
        <div className="flex flex-col gap-4">
          <Input label="Rule Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Notify manager on leave" />

          <Select label="Trigger — When this happens..."
            value={form.trigger}
            onChange={e => setForm(f => ({ ...f, trigger: e.target.value as AutomationTrigger }))}
            options={Object.entries(TRIGGER_LABELS).map(([v, l]) => ({ value: v, label: l }))} />

          <Select label="Action — Do this..."
            value={form.action}
            onChange={e => updatePayloadFields(e.target.value as AutomationAction)}
            options={Object.entries(ACTION_LABELS).map(([v, l]) => ({ value: v, label: l }))} />

          {/* Dynamic payload fields */}
          {(form.action === 'send_notification' || form.action === 'send_notification_to_manager') && (
            <>
              <Input label="Notification Title" value={form.actionPayload.title || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, title: e.target.value } }))} placeholder="Leave Approved" />
              <Input label="Notification Message" value={form.actionPayload.message || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, message: e.target.value } }))} placeholder="Use {{name}} for the record name" />
            </>
          )}

          {form.action === 'create_task' && (
            <>
              <Input label="Task Title" value={form.actionPayload.taskTitle || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, taskTitle: e.target.value } }))} placeholder="Use {{name}} for record name" />
              <Input label="Description" value={form.actionPayload.taskDescription || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, taskDescription: e.target.value } }))} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Priority" value={form.actionPayload.priority || 'Medium'} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, priority: e.target.value } }))}
                  options={['Low', 'Medium', 'High', 'Urgent'].map(p => ({ value: p, label: p }))} />
                <Input label="Due in (days)" type="number" value={form.actionPayload.dueDays || '3'} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, dueDays: e.target.value } }))} />
              </div>
            </>
          )}

          {form.action === 'create_announcement' && (
            <>
              <Input label="Announcement Title" value={form.actionPayload.title || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, title: e.target.value } }))} placeholder="Use {{name}} for record name" />
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea value={form.actionPayload.content || ''} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, content: e.target.value } }))} rows={2}
                  placeholder="Use {{name}} for the record name"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Department" value={form.actionPayload.department || 'All'} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, department: e.target.value } }))}
                  options={['All', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'].map(d => ({ value: d, label: d }))} />
                <Select label="Priority" value={form.actionPayload.priority || 'Normal'} onChange={e => setForm(f => ({ ...f, actionPayload: { ...f.actionPayload, priority: e.target.value } }))}
                  options={['Normal', 'Important', 'Urgent'].map(p => ({ value: p, label: p }))} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name.trim()}>{editing ? 'Save Changes' : 'Create Rule'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
