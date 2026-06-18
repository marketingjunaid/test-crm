interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}

export function leadStatusVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    New: 'info',
    Contacted: 'warning',
    Qualified: 'success',
    Lost: 'danger',
  };
  return map[status] ?? 'default';
}

export function taskPriorityVariant(p: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    Low: 'default',
    Medium: 'warning',
    High: 'danger',
  };
  return map[p] ?? 'default';
}

export function taskStatusVariant(s: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    Open: 'info',
    'In Progress': 'warning',
    Done: 'success',
  };
  return map[s] ?? 'default';
}

export function dealStageVariant(s: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    Prospecting: 'default',
    Qualification: 'info',
    Proposal: 'warning',
    Negotiation: 'warning',
    'Closed Won': 'success',
    'Closed Lost': 'danger',
  };
  return map[s] ?? 'default';
}
