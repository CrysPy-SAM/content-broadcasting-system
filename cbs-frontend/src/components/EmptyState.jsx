export default function EmptyState({ title, description, action }) {
  return (
    <div className="py-20 text-center fade-up">
      {/* Decorative SVG flourish — geometric, editorial */}
      <svg
        viewBox="0 0 80 80"
        className="mx-auto mb-6 text-ink-300"
        width="80"
        height="80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="40" cy="40" r="36" />
        <path d="M20 40 L60 40 M40 20 L40 60" />
        <circle cx="40" cy="40" r="2" fill="currentColor" />
      </svg>
      <h3 className="font-display text-2xl text-ink-900 mb-2 tracking-tightest">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}
