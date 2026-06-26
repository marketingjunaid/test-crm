import { useState } from 'react';
import { getEmployees } from '../../store/storage';
import PageHeader from '../../components/UI/PageHeader';

const DEPT_COLORS = [
  '#6366f1', '#8b5cf6', '#10b981', '#3b82f6',
  '#f59e0b', '#f43f5e', '#f97316', '#14b8a6',
];

export default function OrgChart() {
  const employees = getEmployees();
  const [filterDept, setFilterDept] = useState('All');

  const departments = [...new Set(employees.map(e => e.department))].sort();
  const deptColorMap: Record<string, string> = {};
  departments.forEach((d, i) => { deptColorMap[d] = DEPT_COLORS[i % DEPT_COLORS.length]; });

  const filtered = filterDept === 'All' ? employees : employees.filter(e => e.department === filterDept);
  const byDept: Record<string, typeof employees> = {};
  filtered.forEach(e => {
    if (!byDept[e.department]) byDept[e.department] = [];
    byDept[e.department].push(e);
  });

  return (
    <div>
      <PageHeader title="Org Chart" subtitle="Visual overview of your organization structure" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{departments.length}</div>
          <div className="text-xs text-slate-500 mt-1">Departments</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{employees.filter(e => e.status === 'Active').length}</div>
          <div className="text-xs text-slate-500 mt-1">Active</div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Department:</label>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-8">
        {Object.entries(byDept).sort().map(([dept, emps]) => (
          <div key={dept}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: deptColorMap[dept] }} />
              <h3 className="font-semibold text-slate-900">{dept}</h3>
              <span className="text-xs text-slate-400">{emps.length} employee{emps.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {emps.map(emp => (
                <div key={emp.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3"
                    style={{ backgroundColor: deptColorMap[dept] }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.role}</p>
                  <span className="mt-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: deptColorMap[dept] + '20', color: deptColorMap[dept] }}>
                    {emp.contractType}
                  </span>
                  <span className={`mt-1 text-xs px-2 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(byDept).length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
}
