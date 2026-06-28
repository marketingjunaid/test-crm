import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { EmptyState } from '../../components/UI/EmptyState';
import { getEmployees, saveEmployees, getDepartments, getUsers, saveUsers, getCompany } from '../../store/storage';
import { fireTrigger } from '../../utils/automationEngine';
import { useAuth } from '../../contexts/AuthContext';
import type { Employee, AppUser } from '../../types';

const empty: Omit<Employee,'id'|'createdAt'> = {
  name:'', email:'', phone:'', role:'', department:'', salary:0, joinDate:'',
  status:'Active', contractType:'Full-time', managerId:'',
  address:'', emergencyContact:'', emergencyPhone:'', dateOfBirth:'', nationality:'',
};

type GrantForm = { role: AppUser['role']; password: string; confirmPassword: string; };
const emptyGrant: GrantForm = { role: 'Employee', password: '', confirmPassword: '' };

export default function Employees() {
  const [employees, setEmployees] = useState(getEmployees());
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee|null>(null);
  const [form, setForm] = useState<Omit<Employee,'id'|'createdAt'>>(empty);
  const [showMore, setShowMore] = useState(false);

  const [grantModal, setGrantModal] = useState(false);
  const [grantTarget, setGrantTarget] = useState<Employee|null>(null);
  const [grantForm, setGrantForm] = useState<GrantForm>(emptyGrant);
  const [showPass, setShowPass] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);
  const [provisionedUser, setProvisionedUser] = useState<AppUser|null>(null);

  const { currentUser } = useAuth();
  const canGrantAccess = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const depts = ['All', ...getDepartments().map(d=>d.name)];

  const save = () => {
    const isNew = !editing;
    let updated: Employee[];

    if (editing) {
      updated = employees.map(e => {
        if (e.id !== editing.id) return e;
        const next = { ...editing, ...form };
        // Auto-suspend linked user if employee goes Inactive
        if (form.status === 'Inactive' && editing.status === 'Active' && next.linkedUserId) {
          const users = getUsers();
          saveUsers(users.map(u => u.id === next.linkedUserId ? { ...u, status: 'Inactive' as const } : u));
        }
        return next;
      });
    } else {
      updated = [...employees, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }];
    }

    saveEmployees(updated); setEmployees(updated); setModal(false); setEditing(null); setForm(empty); setShowMore(false);
    if (isNew) fireTrigger('employee_added', { name: form.name, department: form.department });
  };

  const del = (id: string) => {
    if (!confirm('Delete employee?')) return;
    const u = employees.filter(e => e.id !== id);
    saveEmployees(u); setEmployees(u);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      name: e.name, email: e.email, phone: e.phone, role: e.role,
      department: e.department, salary: e.salary, joinDate: e.joinDate,
      status: e.status, contractType: e.contractType, managerId: e.managerId || '',
      address: e.address || '', emergencyContact: e.emergencyContact || '',
      emergencyPhone: e.emergencyPhone || '', dateOfBirth: e.dateOfBirth || '',
      nationality: e.nationality || '',
    });
    setShowMore(false);
    setModal(true);
  };

  const openGrant = (e: Employee) => {
    setGrantTarget(e);
    setGrantForm(emptyGrant);
    setShowPass(false);
    setGrantModal(true);
  };

  const grantAccess = () => {
    if (!grantTarget) return;
    if (grantForm.password !== grantForm.confirmPassword) { alert('Passwords do not match'); return; }
    if (grantForm.password.length < 6) { alert('Password must be at least 6 characters'); return; }

    const newUser: AppUser = {
      id: crypto.randomUUID(),
      name: grantTarget.name,
      email: grantTarget.email,
      password: grantForm.password,
      role: grantForm.role,
      department: grantTarget.department,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      linkedEmployeeId: grantTarget.id,
      mustChangePassword: false,
      hasLoggedIn: false,
    };

    const users = getUsers();
    saveUsers([...users, newUser]);

    const updatedEmployees = employees.map(e =>
      e.id === grantTarget.id ? { ...e, linkedUserId: newUser.id } : e
    );
    saveEmployees(updatedEmployees);
    setEmployees(updatedEmployees);

    setProvisionedUser(newUser);
    setGrantModal(false);
    setEmailPreview(true);
  };

  const filtered = employees.filter(e =>
    (deptFilter === 'All' || e.department === deptFilter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()))
  );

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const company = getCompany();

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.filter(e => e.status === 'Active').length} active employees`}
        action={<Button onClick={() => { setEditing(null); setForm(empty); setShowMore(false); setModal(true); }}><Plus size={15}/>Add Employee</Button>}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex gap-1 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${deptFilter === d ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"/>
          </div>
        </div>

        {filtered.length === 0 ? <EmptyState message="No employees found"/> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Employee','Department','Role','Reports To','Salary','Contract','Status','Joined',...(canGrantAccess?['Access']:[]),''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const manager = e.managerId ? employees.find(m => m.id === e.managerId) : null;
                const hasAccess = !!e.linkedUserId;
                return (
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{e.name[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{e.name}</p>
                          <p className="text-xs text-slate-400">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{e.department}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{e.role}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {manager
                        ? <span className="flex items-center gap-1"><span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{manager.name[0]}</span>{manager.name}</span>
                        : <span className="text-slate-400 text-xs">Direct to HR</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{fmt(e.salary)}</td>
                    <td className="px-5 py-3.5"><Badge label={e.contractType}/></td>
                    <td className="px-5 py-3.5"><Badge label={e.status}/></td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{e.joinDate}</td>
                    {canGrantAccess && (
                      <td className="px-5 py-3.5">
                        {hasAccess
                          ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"><ShieldCheck size={13}/>Active</span>
                          : <button onClick={() => openGrant(e)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                              <ShieldCheck size={12}/>Grant Access
                            </button>
                        }
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"><Pencil size={14}/></button>
                        <button onClick={() => del(e.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Job Title / Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
          <Input label="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
          <Input label="Annual Salary ($)" type="number" value={form.salary} onChange={e => setForm({...form, salary: Number(e.target.value)})} />
          <Input label="Join Date" type="date" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} />
          <Select label="Contract Type" value={form.contractType} onChange={e => setForm({...form, contractType: e.target.value as Employee['contractType']})}
            options={['Full-time','Part-time','Contract'].map(v => ({value: v, label: v}))} />
          <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value as Employee['status']})}
            options={['Active','Inactive'].map(v => ({value: v, label: v}))} />
          <Select label="Reports To (Manager / Team Lead)" value={form.managerId || ''}
            onChange={e => setForm({...form, managerId: e.target.value})}
            options={[{value:'',label:'— Direct to HR (no manager) —'}, ...employees.filter(m => m.id !== (editing?.id)).map(m => ({value: m.id, label: `${m.name} — ${m.role}`}))]} />
        </div>

        <button onClick={() => setShowMore(!showMore)}
          className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          {showMore ? '▲ Hide additional details' : '▼ Show additional details (address, emergency contact, DOB)'}
        </button>

        {showMore && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="col-span-2">
              <Input label="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <Input label="Emergency Contact Name" value={form.emergencyContact || ''} onChange={e => setForm({...form, emergencyContact: e.target.value})} />
            <Input label="Emergency Contact Phone" value={form.emergencyPhone || ''} onChange={e => setForm({...form, emergencyPhone: e.target.value})} />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth || ''} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
            <Input label="Nationality" value={form.nationality || ''} onChange={e => setForm({...form, nationality: e.target.value})} />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? 'Update' : 'Add'} Employee</Button>
        </div>
      </Modal>

      {/* Grant System Access Modal */}
      <Modal isOpen={grantModal} onClose={() => setGrantModal(false)} title="Grant System Access" size="md">
        {grantTarget && (
          <div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">{grantTarget.name[0]}</div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{grantTarget.name}</p>
                <p className="text-xs text-slate-500">{grantTarget.email} · {grantTarget.department}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="System Role"
                value={grantForm.role}
                onChange={e => setGrantForm({...grantForm, role: e.target.value as AppUser['role']})}
                options={['Employee','Manager','Admin','Super Admin'].map(v => ({value: v, label: v}))}
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Temporary Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={grantForm.password}
                    onChange={e => setGrantForm({...grantForm, password: e.target.value})}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={grantForm.confirmPassword}
                  onChange={e => setGrantForm({...grantForm, confirmPassword: e.target.value})}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">The employee will receive a welcome email with their login credentials. They can change their password after logging in.</p>

            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setGrantModal(false)}>Cancel</Button>
              <Button onClick={grantAccess}><ShieldCheck size={14}/>Grant Access</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Email Preview Modal */}
      <Modal isOpen={emailPreview} onClose={() => { setEmailPreview(false); setProvisionedUser(null); }} title="Welcome Email Preview" size="lg">
        {provisionedUser && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
              <Mail size={14}/>
              <span>This email will be sent to <strong>{provisionedUser.email}</strong></span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Email header */}
              <div className="bg-indigo-600 px-8 py-6 text-center">
                <div className="inline-flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">O</div>
                  <span className="font-bold text-lg">{company.name}</span>
                </div>
              </div>
              {/* Email body */}
              <div className="bg-white px-8 py-6 space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Welcome to {company.name}, {provisionedUser.name}! 🎉</h2>
                <p className="text-sm text-slate-600">Your system account has been created. You can now log in to OrgOS using the credentials below.</p>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Login URL</span>
                    <span className="text-indigo-600 font-mono text-xs">{window.location.origin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Email</span>
                    <span className="font-mono text-xs text-slate-800">{provisionedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Password</span>
                    <span className="font-mono text-xs text-slate-800">{provisionedUser.password}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Role</span>
                    <span className="text-slate-800">{provisionedUser.role}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">For security, please change your password after your first login. If you have any issues, contact your system administrator.</p>
                <p className="text-sm text-slate-600">Welcome aboard!<br/><span className="font-medium">{company.name} Team</span></p>
              </div>
              {/* Email footer */}
              <div className="bg-slate-50 px-8 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
                {company.name} · {company.address}<br/>{company.email} · {company.website}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => { setEmailPreview(false); setProvisionedUser(null); }}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
