const STYLES = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  approved: 'bg-forest-700/10 text-forest-700 border-forest-600/40',
  rejected: 'bg-sienna-700/10 text-sienna-700 border-sienna-600/40',
};

export default function StatusBadge({ status, className = '' }) {
  const style = STYLES[status] || 'bg-ink-100 text-ink-700 border-ink-400';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold border ${style} ${className}`}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
