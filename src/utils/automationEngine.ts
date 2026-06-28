import type { AutomationRule, AutomationLog, AutomationTrigger } from '../types';
import {
  getAutomationRules, saveAutomationRules,
  getAutomationLogs, saveAutomationLogs,
  getTasks, saveTasks,
  getAnnouncements, saveAnnouncements,
  getNotifications, saveNotifications,
  getTickets, saveTickets,
} from '../store/storage';

type TriggerPayload = Record<string, string>;

function logRun(rule: AutomationRule, detail: string, success: boolean) {
  const logs = getAutomationLogs();
  const entry: AutomationLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ruleId: rule.id,
    ruleName: rule.name,
    trigger: rule.trigger,
    action: rule.action,
    detail,
    ranAt: new Date().toISOString(),
    success,
  };
  saveAutomationLogs([entry, ...logs].slice(0, 200));

  const rules = getAutomationRules();
  saveAutomationRules(rules.map(r =>
    r.id === rule.id ? { ...r, runCount: r.runCount + 1, lastRun: entry.ranAt } : r
  ));
}

function checkConditions(rule: AutomationRule, payload: TriggerPayload): boolean {
  return rule.conditions.every(c => {
    const val = payload[c.field] || '';
    return c.operator === 'equals' ? val === c.value : val !== c.value;
  });
}

function executeAction(rule: AutomationRule, payload: TriggerPayload) {
  const p = rule.actionPayload;

  if (rule.action === 'send_notification' || rule.action === 'send_notification_to_manager') {
    const notifs = getNotifications();
    saveNotifications([{
      id: Date.now().toString(),
      title: p.title || `Automation: ${rule.name}`,
      message: p.message || `Triggered by: ${rule.trigger}`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    }, ...notifs]);
    logRun(rule, `Notification sent: "${p.title || rule.name}"`, true);
    return;
  }

  if (rule.action === 'create_task') {
    const tasks = getTasks();
    const due = new Date();
    due.setDate(due.getDate() + Number(p.dueDays || 3));
    saveTasks([{
      id: Date.now().toString(),
      title: (p.taskTitle || rule.name).replace('{{name}}', payload.name || ''),
      description: p.taskDescription || `Auto-created by automation: ${rule.name}`,
      assignedTo: p.assignedTo || payload.assignedTo || '',
      priority: (p.priority as 'Low' | 'Medium' | 'High' | 'Urgent') || 'Medium',
      status: 'To Do',
      dueDate: due.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }, ...tasks]);
    logRun(rule, `Task created: "${p.taskTitle || rule.name}"`, true);
    return;
  }

  if (rule.action === 'create_announcement') {
    const announcements = getAnnouncements();
    saveAnnouncements([{
      id: Date.now().toString(),
      title: (p.title || rule.name).replace('{{name}}', payload.name || ''),
      content: (p.content || `Automation triggered: ${rule.name}`).replace('{{name}}', payload.name || ''),
      department: p.department || 'All',
      priority: (p.priority as 'Normal' | 'Important' | 'Urgent') || 'Normal',
      pinned: false,
      createdBy: 'Automation',
      createdAt: new Date().toISOString(),
    }, ...announcements]);
    logRun(rule, `Announcement posted: "${p.title || rule.name}"`, true);
    return;
  }

  if (rule.action === 'escalate_ticket') {
    const ticketId = payload.ticketId;
    if (!ticketId) { logRun(rule, 'No ticket ID in payload', false); return; }
    const tickets = getTickets();
    const updated = tickets.map(t =>
      t.id === ticketId ? { ...t, priority: 'Urgent' as const } : t
    );
    saveTickets(updated);
    logRun(rule, `Ticket ${ticketId} escalated to Urgent`, true);
    return;
  }

  logRun(rule, `Unknown action: ${rule.action}`, false);
}

export function fireTrigger(trigger: AutomationTrigger, payload: TriggerPayload = {}) {
  const rules = getAutomationRules();
  const matching = rules.filter(r => r.enabled && r.trigger === trigger);
  for (const rule of matching) {
    if (checkConditions(rule, payload)) {
      try {
        executeAction(rule, payload);
      } catch (e) {
        logRun(rule, `Error: ${String(e)}`, false);
      }
    }
  }
}

export function initBuiltInRules() {
  const existing = getAutomationRules();
  if (existing.some(r => r.isBuiltIn)) return;

  const builtIns: AutomationRule[] = [
    {
      id: 'builtin-1',
      name: 'Welcome new employee',
      trigger: 'employee_added',
      action: 'create_announcement',
      actionPayload: {
        title: 'Welcome {{name}}!',
        content: 'Please join us in welcoming {{name}} to the team! 🎉',
        department: 'All',
        priority: 'Normal',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
    {
      id: 'builtin-2',
      name: 'Notify on leave approval',
      trigger: 'leave_approved',
      action: 'send_notification',
      actionPayload: {
        title: 'Leave Approved',
        message: 'A leave request for {{name}} has been approved.',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
    {
      id: 'builtin-3',
      name: 'Create onboarding tasks for new hire',
      trigger: 'candidate_hired',
      action: 'create_task',
      actionPayload: {
        taskTitle: 'Onboarding: Set up workspace for {{name}}',
        taskDescription: 'Prepare laptop, accounts, and welcome kit for new hire.',
        priority: 'High',
        dueDays: '2',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
    {
      id: 'builtin-4',
      name: 'Notify team when deal is won',
      trigger: 'deal_won',
      action: 'create_announcement',
      actionPayload: {
        title: '🏆 Deal Won: {{name}}',
        content: 'Great news! We just closed the deal: {{name}}. Congratulations to the sales team!',
        department: 'All',
        priority: 'Important',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
    {
      id: 'builtin-5',
      name: 'Create follow-up task on deal won',
      trigger: 'deal_won',
      action: 'create_task',
      actionPayload: {
        taskTitle: 'Follow-up: Send contract for {{name}}',
        taskDescription: 'Send contract and kickoff email to client.',
        priority: 'High',
        dueDays: '1',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
    {
      id: 'builtin-6',
      name: 'Notify on new support ticket',
      trigger: 'ticket_created',
      action: 'send_notification',
      actionPayload: {
        title: 'New Support Ticket',
        message: 'A new support ticket has been submitted: {{name}}',
      },
      conditions: [],
      enabled: true,
      runCount: 0,
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
    },
  ];

  saveAutomationRules([...existing, ...builtIns]);
}
