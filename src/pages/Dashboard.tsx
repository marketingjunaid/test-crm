import { Users, TrendingUp, DollarSign, Headphones, CheckSquare, Calendar, ClipboardList, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard } from '../components/UI/StatCard';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmployees, getDeals, getInvoices, getTickets, getTasks,
  getLeaves, getLeads, getAnnouncements, getAttendance,
} from '../store/storage';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const revenueChartData = [
  { month: 'Aug', revenue: 38000, expenses: 22000 },
  { month: 'Sep', revenue: 42000, expenses: 25000 },
  { month: 'Oct', revenue: 35000, expenses: 21000 },
  { month: 'Nov', revenue: 55000, expenses: 30000 },
  { month: 'Dec', revenue: 48000, expenses: 28000 },
  { month: 'Jan', revenue: 61000, expenses: 35000 },
];

// ─── Super Admin / Admin view ────────────────────────────────────────────────

function AdminDashboard() {
  const employees = getEmployees();
  const deals = getDeals();
  const invoices = getInvoices();
  const tickets = getTickets();
  const tasks = getTasks();
  const leaves = getLeaves();
  const leads = getLeads();
  const announcements = getAnnouncements();

  const revenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const activeDeals = deals.filter(d => !['Won', 'Lost'].includes(d.stage)).length;
  const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending Manager' || l.status === 'Pending HR').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Employees" value={employees.filter(e => e.status === 'Active').length} icon={<Users size={16} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Active Deals" value={activeDeals} icon={<TrendingUp size={16} className="text-violet-600" />} color="bg-violet-50" />
        <StatCard label="Revenue" value={fmt(revenue)} icon={<DollarSign size={16} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Open Tickets" value={openTickets} icon={<Headphones size={16} className="text-orange-600" />} color="bg-orange-50" />
        <StatCard label="Pending Tasks" value={pendingTasks} icon={<CheckSquare size={16} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Leave Requests" value={pendingLeaves} icon={<Calendar size={16} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Revenue vs Expenses (6 months)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueChartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
            <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="expenses" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Leads</h2>
          <div className="flex flex-col gap-2">
            {leads.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.name}</p>
                  <p className="text-xs text-slate-500">{l.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={l.status} />
                  <span className="text-xs text-slate-400">{fmtDate(l.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Pending Tasks</h2>
          <div className="flex flex-col gap-2">
            {tasks.filter(t => t.status !== 'Done').slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge label={t.priority} />
                  <span className="text-xs text-slate-400">{fmtDate(t.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Announcements</h2>
          <div className="flex flex-col gap-3">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge label={a.priority} />
                  <span className="text-xs text-slate-400">{fmtDate(a.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Leave Requests</h2>
          <div className="flex flex-col gap-2">
            {leaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.employeeName}</p>
                  <p className="text-xs text-slate-500">{l.type} · {l.days} day{l.days > 1 ? 's' : ''}</p>
                </div>
                <Badge label={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Manager view ─────────────────────────────────────────────────────────────

function ManagerDashboard({ department }: { department: string }) {
  const employees = getEmployees();
  const tasks = getTasks();
  const tickets = getTickets();
  const leaves = getLeaves();
  const announcements = getAnnouncements();

  const teamMembers = employees.filter(e => e.department === department && e.status === 'Active');
  const teamNames = teamMembers.map(e => e.name);

  const teamTasks = tasks.filter(t => teamNames.includes(t.assignedTo));
  const pendingTeamTasks = teamTasks.filter(t => t.status !== 'Done');

  const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;

  const teamLeaves = leaves.filter(l => teamNames.includes(l.employeeName));
  const pendingLeaves = teamLeaves.filter(l => l.status === 'Pending Manager' || l.status === 'Pending HR');

  const taskChartData = [
    { status: 'To Do', count: teamTasks.filter(t => t.status === 'To Do').length },
    { status: 'In Progress', count: teamTasks.filter(t => t.status === 'In Progress').length },
    { status: 'Done', count: teamTasks.filter(t => t.status === 'Done').length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Team Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">{department} department overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Team Members" value={teamMembers.length} icon={<Users size={16} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Pending Tasks" value={pendingTeamTasks.length} icon={<CheckSquare size={16} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Open Tickets" value={openTickets} icon={<Headphones size={16} className="text-orange-600" />} color="bg-orange-50" />
        <StatCard label="Leave Requests" value={pendingLeaves.length} icon={<Calendar size={16} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Task Completion by Status</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={taskChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Team Pending Tasks</h2>
          <div className="flex flex-col gap-2">
            {pendingTeamTasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge label={t.status} />
                  <span className="text-xs text-slate-400">{fmtDate(t.dueDate)}</span>
                </div>
              </div>
            ))}
            {pendingTeamTasks.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Team Leave Requests</h2>
          <div className="flex flex-col gap-2">
            {teamLeaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.employeeName}</p>
                  <p className="text-xs text-slate-500">{l.type} · {l.days} day{l.days > 1 ? 's' : ''}</p>
                </div>
                <Badge label={l.status} />
              </div>
            ))}
            {teamLeaves.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No leave requests</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Announcements</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge label={a.priority} />
                  <span className="text-xs text-slate-400">{fmtDate(a.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Employee view ────────────────────────────────────────────────────────────

function EmployeeDashboard({ userId, userName }: { userId: string; userName: string }) {
  const tasks = getTasks();
  const leaves = getLeaves();
  const attendance = getAttendance();
  const announcements = getAnnouncements();

  const myTasks = tasks.filter(t => t.assignedTo === userName);
  const myPendingTasks = myTasks.filter(t => t.status !== 'Done');

  const myLeaves = leaves.filter(l => l.employeeId === userId);
  const approvedLeaveDays = myLeaves
    .filter(l => l.status === 'Approved')
    .reduce((s, l) => s + l.days, 0);
  const leaveBalance = Math.max(0, 20 - approvedLeaveDays);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const myAttendanceThisMonth = attendance.filter(a => {
    if (a.employeeId !== userId) return false;
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const presentDays = myAttendanceThisMonth.filter(a => a.status === 'Present' || a.status === 'WFH').length;
  const absentDays = myAttendanceThisMonth.filter(a => a.status === 'Absent').length;
  const halfDays = myAttendanceThisMonth.filter(a => a.status === 'Half Day').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Hello, {userName}!</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's your personal overview for today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Tasks" value={myTasks.length} icon={<ClipboardList size={16} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Pending Tasks" value={myPendingTasks.length} icon={<CheckSquare size={16} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Leave Balance" value={`${leaveBalance} days`} icon={<Calendar size={16} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Leave Taken" value={`${approvedLeaveDays} days`} icon={<Calendar size={16} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Attendance This Month</h2>
          <div className="flex gap-4">
            <div className="flex-1 text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{presentDays}</p>
              <p className="text-xs text-slate-500 mt-1">Present</p>
            </div>
            <div className="flex-1 text-center p-4 bg-rose-50 rounded-lg">
              <p className="text-2xl font-bold text-rose-600">{absentDays}</p>
              <p className="text-xs text-slate-500 mt-1">Absent</p>
            </div>
            <div className="flex-1 text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{halfDays}</p>
              <p className="text-xs text-slate-500 mt-1">Half Day</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Upcoming Calendar</h2>
          <div className="flex flex-col items-center justify-center h-24 text-slate-400">
            <Calendar size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No upcoming events</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">My Tasks</h2>
          <div className="flex flex-col gap-2">
            {myPendingTasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                  <p className="text-xs text-slate-500">Due {fmtDate(t.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge label={t.status} />
                  <Badge label={t.priority} />
                </div>
              </div>
            ))}
            {myPendingTasks.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">All tasks completed!</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Announcements</h2>
          <div className="flex flex-col gap-3">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={12} className="text-slate-400" />
                  <Badge label={a.priority} />
                  <span className="text-xs text-slate-400">{fmtDate(a.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.content}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No announcements</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
    return <AdminDashboard />;
  }

  if (currentUser.role === 'Manager') {
    return <ManagerDashboard department={currentUser.department} />;
  }

  return <EmployeeDashboard userId={currentUser.id} userName={currentUser.name} />;
}
