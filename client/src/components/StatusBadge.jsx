'use client';

/**
 * StatusBadge — renders a colored pill badge for document statuses.
 * Gray = Pending, Blue = Processing, Saffron = Needs Review, Green = Validated.
 */
export default function StatusBadge({ status }) {
  const config = {
    Pending: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
    Processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    'Needs Review': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
    },
    Validated: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
  };

  const style = config[status] || config.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
