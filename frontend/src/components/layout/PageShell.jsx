import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

/**
 * PageShell — Layout wrapper for all authenticated pages.
 * Combines Sidebar (desktop) + TopNavbar + main content area.
 */
export default function PageShell({ children, onLocationChange, currentLocation }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Ambient background */}
      <div className="bg-liquid" aria-hidden="true" />
      <div aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 md:ml-64">
        <TopNavbar
          onLocationChange={onLocationChange}
          currentLocation={currentLocation}
        />

        {/* Content: push below fixed topbar (64px mobile, 64px desktop) */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: '72px',      /* below fixed topnav */
            paddingBottom: '80px',   /* above mobile bottom nav */
            paddingLeft: '32px',
            paddingRight: '32px',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
          }}
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
