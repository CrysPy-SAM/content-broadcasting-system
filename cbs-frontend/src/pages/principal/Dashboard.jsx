import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Filter, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ContentCard from '../../components/ContentCard';
import EmptyState from '../../components/EmptyState';
import { api, errMsg } from '../../api/client';

const STATUSES = ['all', 'pending', 'approved', 'rejected'];

export default function PrincipalDashboard() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);

  const [pendingCount, setPendingCount] = useState(0);

  // Fetch list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (statusFilter !== 'all') params.status = statusFilter;
        if (subjectFilter.trim()) params.subject = subjectFilter.trim().toLowerCase();
        const { data } = await api.get('/content', { params });
        if (!cancelled) {
          // Backend returns { data: [...], pagination: {...} } OR a flat array
          const payload = data.data;
          if (Array.isArray(payload)) {
            setItems(payload);
            setPagination({ page: 1, limit: payload.length, total: payload.length, total_pages: 1 });
          } else {
            setItems(payload.data || payload.content || []);
            setPagination(payload.pagination || { page: 1, limit: 12, total: 0, total_pages: 1 });
          }
        }
      } catch (err) {
        if (!cancelled) toast.error(errMsg(err, 'Failed to load library'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, subjectFilter, page]);

  // Fetch pending count for the alert banner
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/approval/pending');
        if (!cancelled) setPendingCount((data.data || []).length);
      } catch {
        /* non-blocking */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subjects = useMemo(() => {
    const set = new Set(items.map((c) => c.subject).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const resetFilters = () => {
    setStatusFilter('all');
    setSubjectFilter('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-parchment-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* Pending alert */}
        {pendingCount > 0 && (
          <Link
            to="/principal/approvals"
            className="group flex items-center justify-between gap-4 mb-10 px-5 py-4 bg-ink-900 text-parchment-50 hover:bg-sienna-700 transition-colors fade-up"
          >
            <div className="flex items-center gap-3">
              <BellRing size={18} className="text-sienna-500 group-hover:text-parchment-50" />
              <span className="text-sm">
                <span className="font-display text-xl mr-2 tracking-tightest">
                  {String(pendingCount).padStart(2, '0')}
                </span>
                items waiting on your decision.
              </span>
            </div>
            <span className="text-xs uppercase tracking-[0.18em]">Review →</span>
          </Link>
        )}

        {/* Header */}
        <header className="mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-6 fade-up">
          <div>
            <span className="eyebrow">— Principal's desk</span>
            <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 mt-2">
              The library
            </h1>
            <p className="text-ink-500 mt-3 max-w-lg">
              Every piece of content sent up by your teaching staff — pending, approved, archived.
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-6xl lg:text-7xl font-light tracking-tightest text-sienna-600">
              {String(pagination.total || items.length).padStart(2, '0')}
            </span>
            <span className="eyebrow">total entries</span>
          </div>
        </header>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-ink-400" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-ink-900 text-parchment-50'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Filter subject…"
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              className="input-block max-w-xs text-sm"
            />
            {(statusFilter !== 'all' || subjectFilter) && (
              <button onClick={resetFilters} className="btn-ghost text-xs">
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Subject tag cloud, when present */}
        {subjects.length > 0 && !subjectFilter && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="eyebrow mr-2">On this page:</span>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className="px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] border border-ink-900/25 text-ink-500 hover:border-ink-900 hover:text-ink-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="paper h-44 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Library is quiet"
            description="No content matches these filters."
            action={
              (statusFilter !== 'all' || subjectFilter) && (
                <button onClick={resetFilters} className="btn-secondary">
                  Reset filters
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-4">
              {items.map((item) => (
                <ContentCard key={item.id} content={item} showTeacher compact />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-12 flex items-center justify-between">
                <span className="eyebrow">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="btn-secondary px-3 py-2"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="btn-secondary px-3 py-2"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
