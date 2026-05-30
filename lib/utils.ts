import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'new':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'needs_reply':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'reviewed':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'converted':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'archived':
      return 'text-gray-500 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    lead: 'Lead',
    support: 'Support',
    product_feedback: 'Product Feedback',
    admin: 'Admin',
    content: 'Content',
    personal: 'Personal',
    other: 'Other',
  };
  return map[category] ?? category;
}

export function sourceTypeLabel(source: string): string {
  const map: Record<string, string> = {
    email: 'Email',
    founder_note: 'Founder Note',
    form_response: 'Form Response',
    support: 'Support',
    feedback: 'Feedback',
    partnership: 'Partnership',
  };
  return map[source] ?? source;
}
