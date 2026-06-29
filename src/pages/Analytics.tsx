import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Briefcase, CheckSquare, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/UI/PageHeader';
import { getDeals, getEmployees, getLeaves, getTasks, getTickets, getInvoices, getExpenses } from '../store/storage';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const deals = useMemo(() => getDeals(), []);
  const employees = useMemo(() => getEmployees(), []);
  const leaves = useMemo(() => getLeaves(), []);
  const tasks = useMemo(() => getTasks(), []);
  const tickets = useMemo(() => getTickets(), []);
  const invoices = useMemo(() => getInvoices(), []);
  const expenses = useMemo(() => getExpenses(), []);

  // Deal pipeline by stage
  const dealsByStage = useMemo(() => {
    const stages = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    return stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0),
    }));
  }, [deals]);

  // Employees by department
  const empByDept = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // Leave status breakdown
  const leaveByStatus = useMemo(() => {
    const statuses = ['Pending Manager', 'Pending HR', 'Approved', 'Rejected'];
    return statuses.map(status => ({
      name: status,
      value: leaves.filter(l => l.status === status).length,
    })).filter(s => s.value > 0);
  }, [leaves]);

  // Task status breakdown
  const tasksByStatus = useMemo(() => {
    const statuses = ['To Do', 'In Progress', 'Review', 'Done'];
    return statuses.map(s => ({ name: s, count: tasks.filter(t => t.status === s).length }));
  }, [tasks]);

  // Invoice revenue by status
  const invoiceStats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
    const pending = invoices.filter(i => i.status === 'Sent').reduce((s, i) => s + i.total, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0);
    return [
      { name: 'Paid', value: paid },
      { name: 'Pending', value: pending },
      { name: 'Overdue', value: overdue },
    ];
  }, [invoices]);

  // Ticket priority breakdown
  const ticketsByPriority = useMemo(() => {
    const prios = ['Low', 'Medium', 'High', 'Urgent'];
    return prios.map(p => ({ name: p, count: tickets.filter(t => t.priority === p).length }));
  }, [tickets]);

  // Monthly expense trend (last 6 months)
  const expenseTrend = useMemo(() => {
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      const amount = expenses
        .filter(e => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      months.push({ month: label, amount });
    }
    return months;
  }, [expenses]);

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const wonDeals = deals.filter(d => d.stage === 'Won').length;
  const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Business intelligence across all modules" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Active Employees</p>
          <p className="text-2xl font-bold text-indigo-600">{employees.filter(e => e.status === 'Active').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Won Deals</p>
          <p className="text-2xl font-bold text-violet-600">{wonDeals}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Open Tickets</p>
          <p className="text-2xl font-bold text-rose-600">{openTickets}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deal Pipeline */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Deal Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dealsByStage} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, 'Deals']} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employees by Department */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Employees by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={empByDept} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {empByDept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><CheckSquare size={16} className="text-indigo-500" /> Task Completion Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tasksByStatus} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Leave Requests by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={leaveByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {leaveByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Expense Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={expenseTrend} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Expenses']} />
              <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Revenue Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Invoice Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={invoiceStats} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {invoiceStats.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'Paid' ? '#10b981' : entry.name === 'Overdue' ? '#ef4444' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Priority */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Briefcase size={16} className="text-violet-500" /> Support Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ticketsByPriority} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ticketsByPriority.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'Urgent' ? '#ef4444' : entry.name === 'High' ? '#f59e0b' : entry.name === 'Medium' ? '#6366f1' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
