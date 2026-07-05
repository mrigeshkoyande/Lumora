import { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard':  'Dashboard',
  '/stock':      'Stock & Supply',
  '/beds':       'Bed Management',
  '/staff':      'Staff & Attendance',
  '/alerts':     'Alerts',
  '/simulation': 'Simulation Engine',
  '/approvals':  'Approvals',
  '/facilities': 'Facility Data Entry',
  '/settings':   'Settings',
};

const mobileNavItems = [
  { to: '/dashboard', icon: 'dashboard',    label: 'Home' },
  { to: '/stock',     icon: 'medication',   label: 'Supply' },
  { to: '/beds',      icon: 'bed',          label: 'Beds' },
  { to: '/alerts',    icon: 'notifications', label: 'Alerts' },
  { to: '/settings',  icon: 'settings',     label: 'Settings' },
];

export default function TopNavbar({ onLocationChange, currentLocation = 'Chennai, India' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locInput, setLocInput] = useState(currentLocation);

  const pageTitle = pageTitles[location.pathname] || 'Arogya OS';

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (onLocationChange && locInput.trim()) {
      onLocationChange(locInput.trim());
    }
  };

  return (
    <>
      {/* Desktop top bar */}
      <header
        className="glass-nav fixed top-0 right-0 z-30 flex items-center justify-between px-8 py-3 hidden md:flex"
        style={{ left: 256, width: 'calc(100% - 256px)' }}
        role="banner"
      >
        {/* Left: page title + location search */}
        <div className="flex items-center gap-6">
          <h1 className="text-headline-mobile font-bold" style={{ color: '#0B2545' }}>
            {pageTitle}
          </h1>

          {/* Location search — visible on dashboard + analysis pages */}
          {['/dashboard', '/alerts', '/stock'].includes(location.pathname) && (
            <form onSubmit={handleLocationSubmit} className="relative hidden lg:block">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-outline)', fontSize: 18 }}
              >
                location_on
              </span>
              <input
                id="topnav-location-input"
                type="text"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
                placeholder="Enter city..."
                className="glass-input rounded-full pl-9 pr-4 py-2 text-sm w-56"
                aria-label="Analysis location"
              />
            </form>
          )}
        </div>

        {/* Right: last update + emergency + notifications + settings + avatar */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1 text-label-sm"
            style={{ color: '#0B2545', opacity: 0.6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>update</span>
            Live data
          </div>

          <button
            id="topnav-emergency-btn"
            className="btn-primary"
            style={{ background: '#ba1a1a', borderRadius: 9999, padding: '8px 16px' }}
            aria-label="Emergency alert"
          >
            Emergency
          </button>

          <button
            id="topnav-notifications-btn"
            className="relative p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label="View notifications"
            onClick={() => navigate('/alerts')}
          >
            <span className="material-symbols-outlined" style={{ color: '#0B2545', fontSize: 22 }}>notifications</span>
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
              style={{ background: '#ba1a1a' }}
            />
          </button>

          <button
            id="topnav-settings-btn"
            className="p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <span className="material-symbols-outlined" style={{ color: '#0B2545', opacity: 0.7, fontSize: 22 }}>settings</span>
          </button>

          {/* User avatar */}
          <button
            id="topnav-avatar-btn"
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white/60"
            style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}
            aria-label="User profile"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            DR
          </button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header
        className="glass-nav fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
        role="banner"
      >
        <div className="font-bold" style={{ color: 'var(--color-primary)', fontSize: 20 }}>Arogya OS</div>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Notifications"
            onClick={() => navigate('/alerts')}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 22 }}>notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/30 transition-colors" aria-label="Settings" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: 22 }}>settings</span>
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-16 md:hidden border-t border-white/20"
        style={{ background: 'rgba(238,252,253,0.85)', backdropFilter: 'blur(24px)' }}
        aria-label="Mobile navigation"
      >
        {mobileNavItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`mobile-nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-primary' : ''
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              background: isActive ? 'rgba(0,100,148,0.1)' : 'transparent',
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
