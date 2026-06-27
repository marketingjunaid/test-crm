import { useState } from 'react';
import { getEmployees, getLeaves, getAttendance, getPayroll } from '../../store/storage';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/UI/PageHeader';
import Badge from '../../components/UI/Badge';
import { User, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { printTable } from '../../utils/export';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'leave', label: 'My Leaves', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'payslips', label: 'Payslips', icon: DollarSign },
];

export default function SelfService() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const employees = getEmployees();
  const myEmployee = employees.find(e => e.name === currentUser?.name);
  const leaves = getLeaves().filter(l => l.employeeId === currentUser?.id || l.employeeName === currentUser?.name);
  const attendance = getAttendance().filter(a => a.employeeId === currentUser?.id || a.employeeName === currentUser?.name);
  const payroll = getPayroll().filter(p => p.employeeId === currentUser?.id || p.employeeName === currentUser?.name);

  const approvedDays = leaves.filter(l => l.status === 'Approved').reduce((s, l) => s + l.days, 0);
  const leaveBalance = Math.max(0, 20 - approvedDays);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthAttendance = attendance.filter(a => a.date.startsWith(thisMonth));

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View your personal details, leaves, attendance and payslips" />

      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-3xl mb-4">
              {currentUser?.name?.[0] || 'U'}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{currentUser?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{currentUser?.role}</p>
            <span className="mt-2 text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">{currentUser?.department}</span>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: currentUser?.name },
                { label: 'Email', value: currentUser?.email },
                { label: 'Role', value: currentUser?.role },
                { label: 'Department', value: currentUser?.department },
                { label: 'Status', value: currentUser?.status || 'Active' },
                { label: 'Join Date', value: myEmployee?.joinDate ? new Date(myEmployee.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'Contract Type', value: myEmployee?.contractType || '—' },
                { label: 'Phone', value: myEmployee?.phone || '—' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm text-slate-900 mt-0.5">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{leaveBalance}</p>
              <p className="text-xs text-slate-600 mt-1">Leave Balance (days)</p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{thisMonthAttendance.filter(a => a.status === 'Present' || a.status === 'WFH').length}</p>
              <p className="text-xs text-slate-600 mt-1">Present This Month</p>
            </div>
            <div className="bg-violet-50 rounded-xl border border-violet-100 p-4 text-center">
              <p className="text-2xl font-bold text-violet-700">{payroll.length > 0 ? fmt(payroll[payroll.length - 1].netSalary) : '—'}</p>
              <p className="text-xs text-slate-600 mt-1">Last Net Salary</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span className="text-slate-500">Balance: <strong className="text-emerald-600">{leaveBalance} days</strong></span>
              <span className="text-slate-500">Used: <strong className="text-rose-600">{approvedDays} days</strong></span>
              <span className="text-slate-500">Total: <strong className="text-slate-900">20 days</strong></span>
            </div>
          </div>
          {leaves.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No leave records found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">From</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">To</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Days</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Reason</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 text-slate-700">{l.type}</td>
                    <td className="px-5 py-3 text-slate-600">{l.fromDate}</td>
                    <td className="px-5 py-3 text-slate-600">{l.toDate}</td>
                    <td className="px-5 py-3 text-slate-700">{l.days}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="px-5 py-3"><Badge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present', value: thisMonthAttendance.filter(a => a.status === 'Present').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'WFH', value: thisMonthAttendance.filter(a => a.status === 'WFH').length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Absent', value: thisMonthAttendance.filter(a => a.status === 'Absent').length, color: 'text-red-500', bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-600 mt-1">{s.label} This Month</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {attendance.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No attendance records found</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50"><th className="text-left px-5 py-3 font-medium text-slate-600">Date</th><th className="text-left px-5 py-3 font-medium text-slate-600">Status</th></tr></thead>
                <tbody>
                  {[...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map(a => (
                    <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-700">{a.date}</td>
                      <td className="px-5 py-3"><Badge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payslips' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {payroll.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No payslip records found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Month</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Basic</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Allowances</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Deductions</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Net Salary</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {[...payroll].sort((a, b) => b.month.localeCompare(a.month)).map(p => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{p.month}</td>
                    <td className="px-5 py-3 text-slate-600">{fmt(p.basicSalary)}</td>
                    <td className="px-5 py-3 text-emerald-600">+{fmt(p.allowances)}</td>
                    <td className="px-5 py-3 text-red-500">-{fmt(p.deductions)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{fmt(p.netSalary)}</td>
                    <td className="px-5 py-3"><Badge status={p.status} /></td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => printTable(`Payslip — ${p.month}`, ['Field', 'Amount'], [
                          ['Basic Salary', fmt(p.basicSalary)],
                          ['Allowances', fmt(p.allowances)],
                          ['Deductions', fmt(p.deductions)],
                          ['Net Salary', fmt(p.netSalary)],
                          ['Status', p.status],
                        ])}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        <FileText size={12} /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
