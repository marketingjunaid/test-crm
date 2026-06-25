import React from 'react';

const colorMap: Record<string, string> = {
  'New': 'bg-blue-50 text-blue-700', 'Active': 'bg-emerald-50 text-emerald-700',
  'Open': 'bg-blue-50 text-blue-700', 'Closed': 'bg-slate-100 text-slate-600',
  'Contacted': 'bg-indigo-50 text-indigo-700', 'Qualified': 'bg-violet-50 text-violet-700',
  'Lost': 'bg-rose-50 text-rose-700', 'Rejected': 'bg-rose-50 text-rose-700',
  'Won': 'bg-emerald-50 text-emerald-700', 'Hired': 'bg-emerald-50 text-emerald-700',
  'Paid': 'bg-emerald-50 text-emerald-700', 'Draft': 'bg-slate-100 text-slate-600',
  'Sent': 'bg-blue-50 text-blue-700', 'Overdue': 'bg-rose-50 text-rose-700',
  'Cancelled': 'bg-slate-100 text-slate-600', 'Pending': 'bg-amber-50 text-amber-700',
  'Approved': 'bg-emerald-50 text-emerald-700', 'Inactive': 'bg-slate-100 text-slate-600',
  'Prospect': 'bg-slate-100 text-slate-600', 'Proposal': 'bg-violet-50 text-violet-700',
  'Negotiation': 'bg-orange-50 text-orange-700', 'Planning': 'bg-blue-50 text-blue-700',
  'On Hold': 'bg-amber-50 text-amber-700', 'Completed': 'bg-emerald-50 text-emerald-700',
  'On Track': 'bg-emerald-50 text-emerald-700', 'At Risk': 'bg-amber-50 text-amber-700',
  'Delayed': 'bg-rose-50 text-rose-700', 'Published': 'bg-emerald-50 text-emerald-700',
  'Resolved': 'bg-emerald-50 text-emerald-700', 'In Progress': 'bg-blue-50 text-blue-700',
  'Reviewed': 'bg-emerald-50 text-emerald-700', 'Submitted': 'bg-blue-50 text-blue-700',
  'Processed': 'bg-violet-50 text-violet-700', 'Received': 'bg-emerald-50 text-emerald-700',
  'Available': 'bg-emerald-50 text-emerald-700', 'Assigned': 'bg-blue-50 text-blue-700',
  'Under Maintenance': 'bg-amber-50 text-amber-700', 'Retired': 'bg-slate-100 text-slate-600',
  'Applied': 'bg-slate-100 text-slate-600', 'Screening': 'bg-blue-50 text-blue-700',
  'Interview': 'bg-violet-50 text-violet-700', 'Offer': 'bg-amber-50 text-amber-700',
  'Low': 'bg-slate-100 text-slate-600', 'Medium': 'bg-blue-50 text-blue-700',
  'High': 'bg-orange-50 text-orange-700', 'Urgent': 'bg-rose-50 text-rose-700',
  'Normal': 'bg-slate-100 text-slate-600', 'Important': 'bg-amber-50 text-amber-700',
  'Annual': 'bg-blue-50 text-blue-700', 'Sick': 'bg-rose-50 text-rose-700',
  'Emergency': 'bg-orange-50 text-orange-700', 'Unpaid': 'bg-slate-100 text-slate-600',
  'Present': 'bg-emerald-50 text-emerald-700', 'Absent': 'bg-rose-50 text-rose-700',
  'Half Day': 'bg-amber-50 text-amber-700', 'WFH': 'bg-blue-50 text-blue-700',
  'Leave': 'bg-violet-50 text-violet-700',
  'Full-time': 'bg-emerald-50 text-emerald-700', 'Part-time': 'bg-blue-50 text-blue-700',
  'Contract': 'bg-amber-50 text-amber-700', 'Internship': 'bg-slate-100 text-slate-600',
  'In': 'bg-emerald-50 text-emerald-700', 'Out': 'bg-rose-50 text-rose-700',
  'Adjustment': 'bg-amber-50 text-amber-700',
  'To Do': 'bg-slate-100 text-slate-600', 'Review': 'bg-violet-50 text-violet-700',
  'Done': 'bg-emerald-50 text-emerald-700', 'Blocked': 'bg-rose-50 text-rose-700',
  'In Review': 'bg-violet-50 text-violet-700', 'Todo': 'bg-slate-100 text-slate-600',
  'admin': 'bg-rose-50 text-rose-700', 'manager': 'bg-violet-50 text-violet-700',
  'employee': 'bg-blue-50 text-blue-700', 'Admin': 'bg-rose-50 text-rose-700',
  'Manager': 'bg-violet-50 text-violet-700', 'Employee': 'bg-blue-50 text-blue-700',
  'Critical': 'bg-rose-100 text-rose-800', 'Remote': 'bg-blue-50 text-blue-700', 'Late': 'bg-amber-50 text-amber-700',
  'Processing': 'bg-blue-50 text-blue-700', 'Confirmed': 'bg-emerald-50 text-emerald-700',
  'Archived': 'bg-slate-100 text-slate-600', 'Discontinued': 'bg-slate-100 text-slate-600',
  'Hardware': 'bg-blue-50 text-blue-700', 'Software': 'bg-violet-50 text-violet-700',
  'Furniture': 'bg-amber-50 text-amber-700', 'Vehicle': 'bg-emerald-50 text-emerald-700',
  'Equipment': 'bg-indigo-50 text-indigo-700', 'Other': 'bg-slate-100 text-slate-600',
  'Technical': 'bg-blue-50 text-blue-700', 'Billing': 'bg-amber-50 text-amber-700',
  'General': 'bg-slate-100 text-slate-600', 'Feature Request': 'bg-violet-50 text-violet-700',
  'Bug': 'bg-rose-50 text-rose-700', 'PDF': 'bg-red-50 text-red-600', 'Word': 'bg-blue-50 text-blue-700',
};

interface Props { label?: string; status?: string; className?: string; }

export const Badge: React.FC<Props> = ({ label, status, className = '' }) => {
  const text = label || status || '';
  const colors = colorMap[text] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors} ${className}`}>
      {text}
    </span>
  );
};
export default Badge;
