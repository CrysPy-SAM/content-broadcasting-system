import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Already logged in — bounce to the right home.
  if (user) {
    const home = user.role === 'principal' ? '/principal' : '/teacher';
    return <Navigate to={location.state?.from?.pathname || home} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }
    try {
      const u = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome, ${u.name.split(' ')[0]}`);
      navigate(u.role === 'principal' ? '/principal' : '/teacher', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Quick-fill for demo accounts
  const fill = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-parchment-100">
      {/* Left — editorial poster */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative hidden lg:flex flex-col justify-between p-12 bg-ink-900 text-parchment-50 overflow-hidden"
      >
        {/* Big background numerals — editorial signature */}
        <div className="absolute -right-24 -bottom-32 font-display font-light text-[28rem] leading-none text-parchment-50/[0.04] select-none pointer-events-none">
          ’26
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-sienna-500" />
            <span className="eyebrow text-parchment-50/60">Vol. 1 · Issue 01</span>
          </div>
          <Link to="/" className="font-display text-4xl font-medium tracking-tightest">
            The Broadcast
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-5xl xl:text-6xl font-light leading-[0.95] tracking-tightest mb-6"
          >
            A quiet wire <em className="text-sienna-500 font-normal">between</em> the staff room and the classroom.
          </motion.h1>
          <p className="text-parchment-50/70 text-base leading-relaxed max-w-md">
            Teachers upload, the principal approves, students see what's live — all on a single rotating broadcast that runs itself, minute by minute.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-parchment-50/40 font-mono">
          <span>EST. 2026</span>
          <span className="flex items-center gap-2">
            <Radio size={12} className="text-sienna-500" />
            ON-AIR / DAILY
          </span>
        </div>
      </motion.aside>

      {/* Right — form */}
      <main className="flex items-center justify-center p-8 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only header */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-sienna-500" />
              <span className="eyebrow">Sign in</span>
            </div>
            <Link to="/" className="font-display text-3xl font-medium tracking-tightest text-ink-900 block">
              The Broadcast
            </Link>
          </div>

          <div className="hidden lg:block mb-10">
            <span className="eyebrow">— Sign in</span>
            <h2 className="font-display text-4xl font-light tracking-tightest text-ink-900 mt-2">
              Step into the studio.
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="email" className="eyebrow block mb-1">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="eyebrow block mb-1">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo account picker */}
          <div className="mt-10 pt-6 rule">
            <span className="eyebrow block mb-3">Demo accounts (from seed)</span>
            <div className="flex flex-col gap-1.5 text-sm">
              <button
                onClick={() => fill('principal@school.com', 'principal123')}
                className="text-left flex justify-between gap-3 py-1.5 px-1 hover:bg-parchment-200 transition-colors group"
              >
                <span className="font-mono text-ink-700">principal@school.com</span>
                <span className="eyebrow opacity-60 group-hover:opacity-100">use →</span>
              </button>
              <button
                onClick={() => fill('teacher1@school.com', 'teacher123')}
                className="text-left flex justify-between gap-3 py-1.5 px-1 hover:bg-parchment-200 transition-colors group"
              >
                <span className="font-mono text-ink-700">teacher1@school.com</span>
                <span className="eyebrow opacity-60 group-hover:opacity-100">use →</span>
              </button>
              <button
                onClick={() => fill('teacher2@school.com', 'teacher123')}
                className="text-left flex justify-between gap-3 py-1.5 px-1 hover:bg-parchment-200 transition-colors group"
              >
                <span className="font-mono text-ink-700">teacher2@school.com</span>
                <span className="eyebrow opacity-60 group-hover:opacity-100">use →</span>
              </button>
            </div>
          </div>

          <div className="mt-10 text-xs text-ink-500">
            Looking for a live broadcast?{' '}
            <Link to="/" className="text-sienna-600 hover:underline">View public stream →</Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
