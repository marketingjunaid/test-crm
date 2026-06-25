import { useState } from 'react';
import { getCompany, saveCompany, getUsers, saveUsers } from '../../store/storage';
import type { CompanySettings, AppUser, AppSection } from '../../types';
import { ALL_SECTIONS, SECTION_LABELS, ROLE_DEFAULTS } from '../../permissions';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/UI/PageHeader';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Modal from '../../components/UI/Modal';
import Badge from '../../components/UI/Badge';
import { Save, Plus, Trash2, Edit2, Building2, Users, Bell, Shield } from 'lucide-react';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: AppUser['role'];
  department: string;
  useCustomAccess: boolean;
  sectionOverrides: AppSection[];
}

export default function Settings() {
  const { currentUser, refreshSession } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(getCompany());
  const [users, setUsers] = useState<AppUser[]>(getUsers());
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    name: '', email: '', password: '', role: 'Employee', department: '',
    useCustomAccess: false, sectionOverrides: [],
  });

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isAdmin = currentUser?.role === 'Admin';

  const canManageUser = (u: AppUser) => {
    if (isSuperAdmin) return true;
    if (isAdmin && u.role === 'Super Admin') return false;
    return isAdmin;
  };

  const availableRoles = (): AppUser['role'][] => {
    if (isSuperAdmin) return ['Super Admin', 'Admin', 'Manager', 'Employee'];
    if (isAdmin) return ['Admin', 'Manager', 'Employee'];
    return [];
  };

  const visibleUsers = users.filter(u => {
    if (isSuperAdmin) return true;
    if (isAdmin) return u.role !== 'Super Admin';
    return false;
  });

  const saveSettings = () => {
    saveCompany(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openUserModal = (u?: AppUser) => {
    if (u) {
      setEditUser(u);
      setUserForm({
        name: u.name, email: u.email, password: u.password,
        role: u.role, department: u.department || '',
        useCustomAccess: !!u.sectionOverrides,
        sectionOverrides: u.sectionOverrides ?? ROLE_DEFAULTS[u.role],
      });
    } else {
      setEditUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'Employee', department: '', useCustomAccess: false, sectionOverrides: [] });
    }
    setShowUserModal(true);
  };

  const handleRoleChange = (role: AppUser['role']) => {
    setUserForm(p => ({
      ...p,
      role,
      sectionOverrides: p.useCustomAccess ? ROLE_DEFAULTS[role] : p.sectionOverrides,
    }));
  };

  const toggleSection = (section: AppSection) => {
    setUserForm(p => ({
      ...p,
      sectionOverrides: p.sectionOverrides.includes(section)
        ? p.sectionOverrides.filter(s => s !== section)
        : [...p.sectionOverrides, section],
    }));
  };

  const saveUser = () => {
    const overrides = userForm.useCustomAccess ? userForm.sectionOverrides : undefined;
    let updated: AppUser[];
    if (editUser) {
      updated = users.map(u => u.id === editUser.id
        ? { ...u, name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role, department: userForm.department, sectionOverrides: overrides }
        : u
      );
    } else {
      updated = [...users, {
        id: crypto.randomUUID(), name: userForm.name, email: userForm.email,
        password: userForm.password, role: userForm.role, department: userForm.department,
        status: 'Active' as const, createdAt: new Date().toISOString().split('T')[0],
        sectionOverrides: overrides,
      }];
    }
    saveUsers(updated);
    setUsers(updated);
    if (editUser && currentUser?.id === editUser.id) refreshSession();
    setShowUserModal(false);
  };

  const delUser = (id: string) => {
    const u = users.filter(u => u.id !== id);
    saveUsers(u);
    setUsers(u);
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: <Building2 size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your OrgOS workspace" />
      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'company' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h2>
              <div className="grid grid-cols-2 gap-5">
                <Input label="Company Name" value={settings.name} onChange={e => setSettings(p => ({ ...p, name: e.target.value }))} />
                <Input label="Email" value={settings.email} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} />
                <Input label="Phone" value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
                <Input label="Website" value={settings.website} onChange={e => setSettings(p => ({ ...p, website: e.target.value }))} />
                <Select label="Currency" value={settings.currency} onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))} options={[{ value: 'USD', label: 'USD ($)' }, { value: 'EUR', label: 'EUR (€)' }, { value: 'GBP', label: 'GBP (£)' }, { value: 'PKR', label: 'PKR (₨)' }]} />
                <Input label="Annual Leaves" type="number" value={String(settings.annualLeaves)} onChange={e => setSettings(p => ({ ...p, annualLeaves: parseInt(e.target.value) || 22 }))} />
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea value={settings.address} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={saveSettings}><Save size={15} className="mr-1.5" />Save Changes</Button>
                {saved && <span className="text-emerald-600 text-sm font-medium">✓ Saved successfully</span>}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">User Management</h2>
                  <p className="text-sm text-slate-500">{visibleUsers.length} users</p>
                </div>
                {(isSuperAdmin || isAdmin) && (
                  <Button onClick={() => openUserModal()}><Plus size={16} className="mr-1" />Add User</Button>
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Department</th>
                    <th className="text-left px-5 py-3 font-medium text-slate-600">Access</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map(u => (
                    <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3"><Badge status={u.role} /></td>
                      <td className="px-5 py-3 text-slate-500">{u.department || '-'}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {u.sectionOverrides ? (
                          <span className="text-indigo-600 font-medium">Custom ({u.sectionOverrides.length})</span>
                        ) : (
                          <span>Role default</span>
                        )}
                      </td>
                      <td className="px-5 py-3 flex gap-1">
                        {canManageUser(u) && (
                          <>
                            <button onClick={() => openUserModal(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"><Edit2 size={13} /></button>
                            {u.id !== currentUser?.id && (
                              <button onClick={() => delUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={13} /></button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  ['Leave Requests', 'Get notified when employees apply for leave'],
                  ['New Tickets', 'Get notified when new support tickets are created'],
                  ['Invoice Due', 'Get notified when invoices are due'],
                  ['Low Stock', 'Get notified when stock falls below minimum level'],
                  ['Task Deadlines', 'Get notified about upcoming task deadlines'],
                ].map(([label, desc]) => (
                  <label key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                    <div><p className="font-medium text-slate-800">{label}</p><p className="text-sm text-slate-500">{desc}</p></div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
              <div className="space-y-4">
                {[
                  ['Two-Factor Authentication', 'Add an extra layer of security to accounts', false],
                  ['Session Timeout', 'Auto-logout after 30 minutes of inactivity', true],
                  ['Login Notifications', 'Get email on new sign-ins', true],
                ].map(([label, desc, checked]) => (
                  <label key={String(label)} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                    <div><p className="font-medium text-slate-800">{label}</p><p className="text-sm text-slate-500">{String(desc)}</p></div>
                    <input type="checkbox" defaultChecked={checked as boolean} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  </label>
                ))}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">Data Management</p>
                  <p className="text-xs text-amber-600 mt-1">All data is stored locally in your browser. Export your data regularly as a backup.</p>
                  <Button variant="secondary" className="mt-3" onClick={() => {
                    const data = { ...localStorage };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'orgos-backup.json';
                    a.click();
                  }}>Export All Data</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editUser ? 'Edit User' : 'Add User'}>
        <div className="space-y-3">
          <Input label="Full Name" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Password" type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
          <Select
            label="Role"
            value={userForm.role}
            onChange={e => handleRoleChange(e.target.value as AppUser['role'])}
            options={availableRoles().map(r => ({ value: r, label: r }))}
          />
          <Input label="Department" value={userForm.department} onChange={e => setUserForm(p => ({ ...p, department: e.target.value }))} />

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={userForm.useCustomAccess}
                onChange={e => setUserForm(p => ({
                  ...p,
                  useCustomAccess: e.target.checked,
                  sectionOverrides: e.target.checked ? ROLE_DEFAULTS[p.role] : [],
                }))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Customize section access</span>
            </label>
            {userForm.useCustomAccess && (
              <div className="grid grid-cols-2 gap-2">
                {ALL_SECTIONS.map(section => (
                  <label key={section} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={userForm.sectionOverrides.includes(section)}
                      onChange={() => toggleSection(section)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                    />
                    <span className="text-xs text-slate-700">{SECTION_LABELS[section]}</span>
                  </label>
                ))}
              </div>
            )}
            {!userForm.useCustomAccess && (
              <p className="text-xs text-slate-500">
                Using role default: {ROLE_DEFAULTS[userForm.role].join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
          <Button onClick={saveUser}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
