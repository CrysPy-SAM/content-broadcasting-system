import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Radio } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherNav = [
    { to: '/teacher', label: 'My Content', end: true },
    { to: '/teacher/upload', label: 'Upload' },
  ];

  const principalNav = [
    { to: '/principal', label: 'Library', end: true },
    { to: '/principal/approvals', label: 'Approvals' },
  ];

  const items = user?.role === 'principal' ? principalNav : teacherNav;

  return (
    <header className="sticky top-0 z-30 bg-parchment-100/80 backdrop-blur-md border-b border-ink-900/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link to={user?.role === 'principal' ? '/principal' : '/teacher'} className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tightest leading-none text-ink-900">
            The Broadcast
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 bg-sienna-500 group-hover:scale-125 transition-transform" />
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                  isActive
                    ? 'text-ink-900 border-b-2 border-sienna-500'
                    : 'text-ink-500 hover:text-ink-900 border-b-2 border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User block */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-ink-900">{user?.name}</span>
            <span className="eyebrow flex items-center gap-1.5">
              {user?.role === 'principal' && <Radio size={10} className="text-sienna-500" />}
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-ink-500 hover:text-sienna-600 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="md:hidden border-t border-ink-900/10 px-6 flex items-center gap-1 overflow-x-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium whitespace-nowrap ${
                isActive ? 'text-ink-900 border-b-2 border-sienna-500' : 'text-ink-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
