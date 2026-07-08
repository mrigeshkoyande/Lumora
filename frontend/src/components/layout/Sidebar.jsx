import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassSurface from '../ui/GlassSurface';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard',  icon: 'dashboard',       label: 'Dashboard' },
      { to: '/alerts',     icon: 'notifications',    label: 'Alerts' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/stock',      icon: 'medication',       label: 'Stock & Supply' },
      { to: '/beds',       icon: 'bed',              label: 'Bed Management' },
      { to: '/staff',      icon: 'group',            label: 'Staff & Attendance' },
      { to: '/facilities', icon: 'local_hospital',   label: 'Facilities' },
    ]
  },
  {
    title: 'Management',
    items: [
      { to: '/simulation', icon: 'psychology',       label: 'Simulation' },
      { to: '/approvals',  icon: 'task_alt',         label: 'Approvals' },
      { to: '/settings',   icon: 'admin_panel_settings', label: 'Settings' },
    ]
  }
];

export default function Sidebar({ collapsed = false, mobileOpen = false, onCloseMobile, onToggleCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed z-40 transition-all duration-300 flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        left-0 top-0 h-screen w-64
        md:left-4 md:top-4 md:h-[calc(100vh-32px)] 
        ${collapsed ? 'md:w-20' : 'md:w-64'}
      `}
      aria-label="Main navigation sidebar"
    >
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={24}
        backgroundOpacity={0.03}
        saturation={1.3}
        brightness={50}
        blur={12}
        className={`glass-sidebar w-full h-full ${collapsed ? 'glass-sidebar-collapsed' : ''}`}
        contentClassName="flex flex-col py-6"
      >
        {/* Logo & Collapse Button */}
        <div
          className={`mb-8 flex items-center justify-between transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'px-6'}`}
          onClick={collapsed && onToggleCollapsed ? onToggleCollapsed : undefined}
          style={{ cursor: collapsed && onToggleCollapsed ? 'pointer' : 'default' }}
          title={collapsed ? "Expand sidebar" : undefined}
        >
          {collapsed ? (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-black/5 text-[#0B2545] transition-all duration-200"
              style={{ background: 'rgba(0,100,148,0.08)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                menu
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,100,148,0.12)' }}
                >
                  <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
                    medical_services
                  </span>
                </div>
                <div className="transition-opacity duration-300 opacity-100 whitespace-nowrap">
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
              {onToggleCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering parent div click
                    onToggleCollapsed();
                  }}
                  className="p-1 rounded-lg hover:bg-black/5 text-[#0B2545] transition-colors flex items-center justify-center animate-fade-in"
                  aria-label="Collapse sidebar"
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    menu_open
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 space-y-4 overflow-y-auto ${collapsed ? 'px-1' : 'px-3'}`} aria-label="Sidebar navigation">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {!collapsed && (
                <div className="sidebar-group-title">
                  {group.title}
                </div>
              )}
              {group.items.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  id={`sidebar-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                  {!collapsed && <span className="text-body-md">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`mt-4 pt-4 border-t border-white/20 space-y-1 ${collapsed ? 'px-1' : 'px-3'}`}>
          {user && (
            <div className={`mb-2 ${collapsed ? 'text-center px-0' : 'px-4 py-3'}`}>
              {!collapsed ? (
                <>
                  <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Logged in as</div>
                  <div className="font-semibold" style={{ color: 'var(--color-on-surface)', fontSize: 13, marginTop: 2 }}>
                    {user.name}
                  </div>
                </>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }} title={`Logged in as ${user.name}`}>
                  account_circle
                </span>
              )}
            </div>
          )}
          <a href="#" className="nav-item" aria-label="Help" onClick={() => onCloseMobile && onCloseMobile()}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help_outline</span>
            {!collapsed && <span className="text-body-md">Help</span>}
          </a>
          <button
            id="sidebar-logout-btn"
            onClick={() => {
              handleLogout();
              onCloseMobile && onCloseMobile();
            }}
            className="nav-item w-full text-left"
            aria-label="Logout"
            style={{ border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
            {!collapsed && <span className="text-body-md">Logout</span>}
          </button>
        </div>
      </GlassSurface>
    </aside>
  );
}
