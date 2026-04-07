'use client';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'purple':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Badge({ text, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getVariantClasses(
        variant
      )}`}
    >
      {text}
    </span>
  );
}

export function getDealStageBadge(stage: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (stage?.toLowerCase()) {
    case 'won':
      return 'success';
    case 'lost':
      return 'danger';
    case 'negotiation':
      return 'warning';
    case 'proposal':
      return 'info';
    case 'qualified':
      return 'purple';
    default:
      return 'default';
  }
}

export function getTaskPriorityBadge(priority: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
}

export function getTaskStatusBadge(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in progress':
      return 'info';
    case 'pending':
      return 'warning';
    case 'overdue':
      return 'danger';
    default:
      return 'default';
  }
}
