import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import ContentCard from '../../components/ContentCard';
import EmptyState from '../../components/EmptyState';
import { api, errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['all', 'pending', 'approved', 'rejected'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (subjectFilter.trim()) params.subject = subjectFilter.trim().toLowerCase();
        const { data } = await api.get('/content/my', { params });
        if (!cancelled) setItems(data.data || []);
      } catch (err) {
        if (!cancelled) toast.error(errMsg(err, 'Failed to load content'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, subjectFilter]);

  // Stats — quick header summary
  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((c) => c.status === 'approved').length;
    const pending = items.filter((c) => c.status === 'pending').length;
    return { total, approved, pending };
  }, [items]);

  return (
    <div className="min-h-screen bg-parchment-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        {/* Page header */}
        <header className="mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-6 fade-up">
          <div>
            <span className="eyebrow">— Studio · {user?.name?.split(' ')[0]}</span>
            <h1 className="font-display text-5xl lg:text-6xl font-light tracking-tightest text-ink-900 mt-2">
              My broadcasts
            </h1>
            <p className="text-ink-500 mt-3 max-w-lg">
              Everything you've sent up the chain. Track approval state and what's currently scheduled to air.
            </p>
          </div>

          <Link to="/teacher/upload" className="btn-primary self-start lg:self-end">
            <Plus size={16} /> Upload content
          </Link>
        </header>

        {/* Stats strip */}
        <section className="grid grid-cols-3 mb-10 border-y border-ink-900/15">
          <Stat label="Total uploads" value={stats.total} />
          <Stat label="Approved & airing" value={stats.approved} accent />
          <Stat label="Awaiting approval" value={stats.pending} />
        </section>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-ink-400" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
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
          <input
            type="text"
            placeholder="Filter by subject…"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="input-block max-w-xs text-sm"
          />
        </section>

        {/* Content list */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="paper h-44 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description={
              statusFilter !== 'all' || subjectFilter
                ? 'Try clearing your filters.'
                : 'Upload your first piece of content and it will be queued for the principal.'
            }
            action={
              <Link to="/teacher/upload" className="btn-primary">
                <Plus size={16} /> Upload content
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent = false }) {
  return (
    <div className="px-2 py-6 border-r last:border-r-0 border-ink-900/15">
      <div className="eyebrow mb-2">{label}</div>
      <div
        className={`font-display text-5xl font-light tracking-tightest ${
          accent ? 'text-sienna-600' : 'text-ink-900'
        }`}
      >
        {String(value).padStart(2, '0')}
      </div>
    </div>
  );
}
