import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Maximize2, Minimize2, Radio } from 'lucide-react';
import { api, errMsg, resolveAsset } from '../../api/client';
import { formatRelative, formatTime } from '../../lib/format';

const POLL_INTERVAL = 30_000; // 30s

export default function LiveBroadcast() {
  const { teacherId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const subject = searchParams.get('subject') || '';

  const [data, setData] = useState(null); // { teacher, broadcast_time, active_content }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track which subject the user is viewing (when multiple come back)
  const [activeSubject, setActiveSubject] = useState(subject || null);

  const pollRef = useRef(null);
  const containerRef = useRef(null);

  const fetchLive = async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const params = {};
      if (subject) params.subject = subject;
      const { data: res } = await api.get(`/content/live/${teacherId}`, { params });
      // Backend returns { data: {...} } on success, { data: null } when nothing live
      setData(res.data || null);
      setError(null);
      // Default-pick the first subject if user hasn't chosen one
      if (res.data?.active_content) {
        const subjects = Object.keys(res.data.active_content);
        if (subjects.length && !activeSubject) {
          setActiveSubject(subjects[0]);
        } else if (subjects.length && !subjects.includes(activeSubject)) {
          setActiveSubject(subjects[0]);
        }
      }
    } catch (err) {
      setError(errMsg(err, 'Could not reach the broadcast'));
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  };

  // Initial fetch + polling
  useEffect(() => {
    fetchLive();
    pollRef.current = setInterval(() => fetchLive({ silent: true }), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, subject]);

  // Tick every second for the countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900 text-parchment-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-parchment-50/20 border-t-sienna-500 rounded-full animate-spin mx-auto mb-4" />
          <span className="eyebrow text-parchment-50/60">Tuning in…</span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <FullScreenMessage
        eyebrow="Signal lost"
        title={error}
        body="Check the teacher ID, or try again in a moment."
        showBack
      />
    );
  }

  // No content
  if (!data || !data.active_content || Object.keys(data.active_content).length === 0) {
    return (
      <FullScreenMessage
        eyebrow="Off air"
        title="Nothing is broadcasting right now."
        body={
          subject
            ? `No content scheduled for "${subject}" at this moment.`
            : 'The teacher hasn\'t scheduled any approved content for this slot.'
        }
        teacherName={data?.teacher?.name}
        showBack
        showRefresh
        onRefresh={() => fetchLive()}
      />
    );
  }

  const subjects = Object.keys(data.active_content);
  const current = data.active_content[activeSubject] || data.active_content[subjects[0]];
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    (current?.file_type || '').toLowerCase()
  );

  // Countdown
  const remaining = current?.scheduled_until
    ? Math.max(0, new Date(current.scheduled_until).getTime() - now)
    : 0;
  const remainingSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  return (
    <div ref={containerRef} className="min-h-screen bg-ink-900 text-parchment-50 flex flex-col">
      {/* Top bar — kiosk header */}
      <header className="border-b border-parchment-50/10 px-6 lg:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-parchment-50/60 hover:text-parchment-50 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="eyebrow text-parchment-50/50 flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-sienna-500 live-dot" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-sienna-500" />
              </span>
              On-air
            </span>
            <h1 className="font-display text-xl lg:text-2xl tracking-tightest font-medium">
              {data.teacher?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Subject tabs */}
          {subjects.length > 1 && (
            <div className="flex bg-parchment-50/5 border border-parchment-50/10">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setActiveSubject(s);
                    if (subject) setSearchParams({});
                  }}
                  className={`px-3 py-1.5 text-xs uppercase tracking-[0.18em] font-medium transition-colors ${
                    activeSubject === s
                      ? 'bg-sienna-600 text-parchment-50'
                      : 'text-parchment-50/60 hover:text-parchment-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => fetchLive()}
            disabled={refreshing}
            className="p-2 text-parchment-50/60 hover:text-parchment-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-parchment-50/60 hover:text-parchment-50 transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Main viewer */}
      <main className="flex-1 grid lg:grid-cols-[1fr_320px]">
        {/* Media stage */}
        <section className="relative flex items-center justify-center bg-ink-900 overflow-hidden p-4 lg:p-8 min-h-[60vh]">
          {/* Crosshatch corners — kiosk feel */}
          <Corner pos="top-4 left-4" />
          <Corner pos="top-4 right-4" />
          <Corner pos="bottom-4 left-4" />
          <Corner pos="bottom-4 right-4" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-full max-h-[80vh] flex items-center justify-center"
            >
              {isImage ? (
                <img
                  src={resolveAsset(current.file_url)}
                  alt={current.title}
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                />
              ) : (
                <div className="paper bg-parchment-100 text-ink-900 p-12 max-w-md text-center">
                  <span className="eyebrow text-sienna-600">{current.file_type}</span>
                  <h3 className="font-display text-3xl mt-4">{current.title}</h3>
                  <a
                    href={resolveAsset(current.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary mt-6"
                  >
                    Open file
                  </a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Sidebar — metadata */}
        <aside className="border-t lg:border-t-0 lg:border-l border-parchment-50/10 p-6 lg:p-8 flex flex-col">
          <span className="eyebrow text-parchment-50/50">Now showing</span>

          <h2 className="font-display text-3xl lg:text-4xl tracking-tightest font-light mt-3 mb-4 leading-tight">
            {current?.title}
          </h2>

          <div className="inline-flex w-fit bg-sienna-600 text-parchment-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] mb-6">
            {current?.subject}
          </div>

          {/* Countdown */}
          <div className="mb-6 pb-6 border-b border-parchment-50/10">
            <span className="eyebrow text-parchment-50/50 block mb-2">
              Rotates in
            </span>
            <div className="font-mono text-5xl tracking-tighter">
              {mm}<span className="text-parchment-50/30">:</span>{ss}
            </div>
            <div className="text-xs text-parchment-50/40 mt-1">
              Until {current?.scheduled_until ? formatTime(current.scheduled_until) : '—'}
            </div>
          </div>

          {/* Meta rows */}
          <dl className="space-y-3 text-sm">
            <Row label="Duration">{current?.duration_minutes} min</Row>
            <Row label="Position">#{(current?.rotation_order ?? 0) + 1} in cycle</Row>
            <Row label="Last polled">{new Date(data.broadcast_time).toLocaleTimeString()}</Row>
          </dl>

          <div className="mt-auto pt-8 text-[10px] text-parchment-50/30 font-mono leading-relaxed">
            <div className="flex items-center gap-1.5 mb-2">
              <Radio size={10} />
              Auto-refresh every {POLL_INTERVAL / 1000}s
            </div>
            <div>ID · {teacherId.slice(0, 8)}…</div>
          </div>
        </aside>
      </main>

      {/* Bottom marquee — adds character */}
      <footer className="border-t border-parchment-50/10 overflow-hidden">
        <div className="marquee whitespace-nowrap py-3 text-xs uppercase tracking-[0.3em] text-parchment-50/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="mx-8">
              The Broadcast · {data.teacher?.name} · {current?.subject} · Now showing &lsquo;{current?.title}&rsquo; ·{' '}
              {subjects.length} subject{subjects.length === 1 ? '' : 's'} live ·
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="eyebrow text-parchment-50/40">{label}</dt>
      <dd className="text-parchment-50/90 text-right">{children}</dd>
    </div>
  );
}

function Corner({ pos }) {
  return (
    <div className={`absolute ${pos} w-6 h-6 pointer-events-none`}>
      <div className="absolute top-0 left-0 w-full h-px bg-parchment-50/20" />
      <div className="absolute top-0 left-0 w-px h-full bg-parchment-50/20" />
    </div>
  );
}

function FullScreenMessage({ eyebrow, title, body, teacherName, showBack, showRefresh, onRefresh }) {
  return (
    <div className="min-h-screen bg-ink-900 text-parchment-50 flex flex-col items-center justify-center px-6 text-center">
      <span className="eyebrow text-sienna-500 mb-4">— {eyebrow}</span>
      <h1 className="font-display text-5xl lg:text-6xl tracking-tightest font-light max-w-2xl mb-4">
        {title}
      </h1>
      {teacherName && (
        <p className="text-parchment-50/40 font-mono text-xs mb-2">FROM · {teacherName}</p>
      )}
      <p className="text-parchment-50/60 max-w-md mb-8">{body}</p>
      <div className="flex gap-3">
        {showBack && (
          <Link to="/" className="btn-secondary !border-parchment-50 !text-parchment-50 hover:!bg-parchment-50 hover:!text-ink-900">
            <ArrowLeft size={14} /> Back
          </Link>
        )}
        {showRefresh && (
          <button onClick={onRefresh} className="btn-primary">
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
