import { resolveAsset } from '../api/client';
import StatusBadge from './StatusBadge';
import { formatDate, formatTimeRange } from '../lib/format';
import { Clock, Image as ImageIcon, User } from 'lucide-react';

/**
 * Content card used in teacher dashboard, principal library, and approvals.
 * - `actions` slot lets parent inject approve/reject buttons.
 * - `compact` reduces vertical space for list views.
 */
export default function ContentCard({ content, actions, compact = false, showTeacher = false }) {
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    (content.file_type || '').toLowerCase()
  );

  return (
    <article className="paper group hover:border-ink-900/40 transition-colors fade-up">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div
          className={`relative bg-parchment-200 border-r border-ink-900/10 overflow-hidden flex-shrink-0 ${
            compact ? 'sm:w-32 h-32 sm:h-auto' : 'sm:w-48 h-48 sm:h-auto'
          }`}
        >
          {isImage ? (
            <img
              src={resolveAsset(content.file_url)}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-ink-400 gap-2">
              <ImageIcon size={32} strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-wider">{content.file_type}</span>
            </div>
          )}
          {/* Subject ribbon */}
          <div className="absolute top-3 left-3 bg-ink-900 text-parchment-50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-medium">
            {content.subject}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-display text-xl sm:text-2xl font-medium text-ink-900 leading-tight tracking-tightest">
              {content.title}
            </h3>
            <StatusBadge status={content.status} />
          </div>

          {content.description && (
            <p className="text-sm text-ink-600 leading-relaxed mb-4 line-clamp-2">
              {content.description}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
            {showTeacher && content.teacher_name && (
              <span className="inline-flex items-center gap-1.5">
                <User size={12} />
                {content.teacher_name}
              </span>
            )}
            {content.start_time && content.end_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} />
                {formatTimeRange(content.start_time, content.end_time)}
              </span>
            )}
            <span className="font-mono text-[10px] text-ink-400">
              {formatDate(content.created_at)}
            </span>
          </div>

          {content.rejection_reason && content.status === 'rejected' && (
            <div className="mt-4 px-3 py-2 bg-sienna-700/5 border-l-2 border-sienna-600 text-xs text-sienna-700">
              <span className="eyebrow text-sienna-700 block mb-1">Rejection reason</span>
              {content.rejection_reason}
            </div>
          )}

          {actions && <div className="mt-5 pt-5 rule flex gap-3">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
