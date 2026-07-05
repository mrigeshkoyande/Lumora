import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',  icon: 'dashboard',       label: 'Dashboard' },
  { to: '/stock',      icon: 'medication',       label: 'Stock & Supply' },
  { to: '/beds',       icon: 'bed',              label: 'Bed Management' },
  { to: '/staff',      icon: 'group',            label: 'Staff & Attendance' },
  { to: '/alerts',     icon: 'notifications',    label: 'Alerts' },
  { to: '/simulation', icon: 'psychology',       label: 'Simulation' },
  { to: '/approvals',  icon: 'task_alt',         label: 'Approvals' },
  { to: '/facilities', icon: 'local_hospital',   label: 'Facilities' },
  { to: '/settings',   icon: 'admin_panel_settings', label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="glass-sidebar fixed left-0 top-0 h-screen w-64 z-40 flex flex-col py-6 hidden md:flex"
      aria-label="Main navigation sidebar"
    >
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,100,148,0.12)' }}
        >
          <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
            medical_services
          </span>
        </div>
        <div>
          <div
            className="font-bold tracking-tight"
            style={{ color: 'var(--color-primary)', fontSize: 20, lineHeight: '24px' }}
          >
            Arogya OS
          </div>
          <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Health Console
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Sidebar navigation">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`sidebar-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
            <span className="text-body-md">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 mt-4 pt-4 border-t border-white/20 space-y-1">
        {user && (
          <div className="px-4 py-3 mb-2">
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Logged in as</div>
            <div className="font-semibold" style={{ color: 'var(--color-on-surface)', fontSize: 13, marginTop: 2 }}>
              {user.name}
            </div>
          </div>
        )}
        <a href="#" className="nav-item" aria-label="Help">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help_outline</span>
          <span className="text-body-md">Help</span>
        </a>
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="nav-item w-full text-left"
          aria-label="Logout"
          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          <span className="text-body-md">Logout</span>
        </button>
      </div>
    </aside>
  );
}
