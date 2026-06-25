import { getInvoices, getExpenses, getBudgets } from '../../store/storage';
import PageHeader from '../../components/UI/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function FinanceReports() {
  const invoices = getInvoices();
  const expenses = getExpenses();
  const budgets = getBudgets();

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((s, i) => s + i.total, 0);
  const netProfit = totalRevenue - totalExpenses;

  const expByCategory: Record<string, number> = {};
  expenses.forEach(e => { expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount; });
  const pieData = Object.entries(expByCategory).map(([name, value]) => ({ name, value }));

  const invByStatus = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
    { name: 'Sent', value: invoices.filter(i => i.status === 'Sent').length },
    { name: 'Draft', value: invoices.filter(i => i.status === 'Draft').length },
    { name: 'Overdue', value: invoices.filter(i => i.status === 'Overdue').length },
  ];

  const budgetData = budgets.map(b => ({ name: b.department, Allocated: b.totalBudget, Spent: b.spent }));

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, color: netProfit >= 0 ? 'text-indigo-600' : 'text-red-500', bg: 'bg-indigo-50' },
    { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <PageHeader title="Finance Reports" subtitle="Financial overview and analytics" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-5`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetData}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="Allocated" fill="#E0E7FF" radius={[4,4,0,0]} /><Bar dataKey="Spent" fill="#6366F1" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Invoice Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={invByStatus} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" /><XAxis type="number" tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} /><Tooltip /><Bar dataKey="value" fill="#6366F1" radius={[0,4,4,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
