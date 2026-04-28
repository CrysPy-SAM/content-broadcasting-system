import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, ArrowRight, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple UUID-v4 sanity check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function BroadcastEntry() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = teacherId.trim();
    if (!UUID_RE.test(id)) {
      toast.error('That doesn\'t look like a valid teacher ID.');
      return;
    }
    navigate(`/live/${id}`);
  };

  return (
    <div className="min-h-screen bg-parchment-100 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-ink-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-medium tracking-tightest text-ink-900">
              The Broadcast
            </span>
            <span className="w-1.5 h-1.5 bg-sienna-500" />
          </div>
          <Link to="/login" className="btn-ghost">
            Staff sign-in →
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 w-full grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-sienna-500" />
            <span className="eyebrow">Public stream</span>
          </div>

          <h1 className="font-display text-6xl lg:text-7xl xl:text-8xl font-light leading-[0.92] tracking-tightest text-ink-900 mb-8">
            Tune in to <em className="text-sienna-600 font-normal">your</em> teacher's wire.
          </h1>

          <p className="text-lg text-ink-600 leading-relaxed max-w-xl">
            Paste your teacher's broadcast ID below to see what's airing right now — content rotates automatically, subject by subject, on a schedule the principal has approved.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-px bg-ink-900/15 border border-ink-900/15">
            <Trio n="01" label="Live, always" body="Polled every 30 seconds. The screen updates as schedules rotate." />
            <Trio n="02" label="No login" body="Students don't need credentials. Just the teacher's ID." />
            <Trio n="03" label="Subject-aware" body="Filter to only see what's airing for one subject right now." />
          </div>
        </motion.div>

        {/* ID entry card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="paper p-8 lg:p-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Radio size={14} className="text-sienna-500" />
            <span className="eyebrow text-sienna-600">Open a frequency</span>
          </div>
          <h2 className="font-display text-3xl font-medium tracking-tightest text-ink-900 mb-6">
            Enter teacher ID
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-ink-500 block mb-1 flex items-center gap-1.5">
                <KeyRound size={11} /> UUID
              </label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="d2a8f1c4-..."
                className="input-field font-mono text-sm"
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Tune in <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 pt-6 rule text-xs text-ink-500 leading-relaxed">
            Your teacher should give you this ID. It's the same UUID across all of their broadcasts and never changes.
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-ink-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between text-xs text-ink-500 font-mono">
          <span>The Broadcast · v1.0</span>
          <span>ON-AIR · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function Trio({ n, label, body }) {
  return (
    <div className="bg-parchment-100 p-5">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-display text-2xl font-light text-sienna-600 tracking-tightest">
          {n}
        </span>
        <span className="eyebrow">{label}</span>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}
