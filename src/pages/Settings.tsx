import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Database, Bell, Palette } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your CRM preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Profile</h2>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">{user?.avatar}</div>
          <div>
            <div className="font-semibold text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <div className="text-xs text-blue-600 mt-0.5 font-medium">{user?.role}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input defaultValue={user?.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input defaultValue={user?.email} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Save Profile</button>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Security</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Change Password</button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="space-y-3">
          {['Email notifications for new leads', 'Task due date reminders', 'Deal stage change alerts', 'Weekly pipeline summary'].map(item => (
            <label key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer">
              <span className="text-sm text-gray-700">{item}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-500 rounded-full transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Database size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Data Management</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (confirm('Export all CRM data?')) {
                const data = localStorage.getItem('crm_data');
                if (data) {
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'crm_export.json'; a.click();
                }
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Export Data (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all data to defaults? This cannot be undone.')) {
                localStorage.removeItem('crm_data');
                window.location.reload();
              }
            }}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
          >
            Reset to Demo Data
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Appearance</h2>
        </div>
        <div className="flex gap-3">
          {['Blue (Default)', 'Green', 'Purple'].map((theme, i) => (
            <button key={theme} className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${i === 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
              {theme}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Theme customization coming soon</p>
      </div>
    </div>
  );
}
