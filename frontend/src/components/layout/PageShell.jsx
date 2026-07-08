import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

/**
 * PageShell — Layout wrapper for all authenticated pages.
 * Combines Sidebar (desktop) + TopNavbar + main content area.
 */
export default function PageShell({ children, onLocationChange, currentLocation }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Ambient background */}
      <div className="bg-liquid" aria-hidden="true" />
      <div aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — responsive layout */}
      <Sidebar
        collapsed={isCollapsed}
        mobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`flex flex-col flex-1 transition-[margin-left] duration-200 ease-out ml-0 ${isCollapsed ? 'md:ml-[112px]' : 'md:ml-[288px]'}`}>
        <TopNavbar
          onLocationChange={onLocationChange}
          currentLocation={currentLocation}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Content: push below fixed topbar (64px mobile, 64px desktop) */}
        <main
          className="flex-1 overflow-y-auto pt-[76px] md:pt-24 px-4 md:px-8"
          style={{
            paddingBottom: '80px',   /* above mobile bottom nav */
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
