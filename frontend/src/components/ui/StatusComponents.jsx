/**
 * LoadingSpinner — Full-screen or inline loading state with Arogya OS branding.
 */
export function LoadingSpinner({ message = 'Analyzing health data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: 300,
        width: '100%',
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
      <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
        {message}
      </p>
    </div>
  );
}

/**
 * ErrorCard — Display API errors gracefully.
 */
export function ErrorCard({ message, onRetry }) {
  return (
    <div
      className="glass-card-static p-6"
      style={{ borderLeft: '4px solid #ba1a1a', borderRadius: 16, maxWidth: 480, margin: '0 auto' }}
      role="alert"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: 24 }}>error</span>
        <h3 className="font-semibold" style={{ color: '#ba1a1a', fontSize: 16 }}>Error</h3>
      </div>
      <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
        {message}
      </p>
      {onRetry && (
        <button
          id="error-card-retry-btn"
          className="btn-primary"
          onClick={onRetry}
          style={{ borderRadius: 8 }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * EmptyState — Displayed when a list/section has no data.
 */
export function EmptyState({ icon = 'info', title = 'No data', description }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '48px 24px',
        color: 'var(--color-on-surface-variant)',
        textAlign: 'center',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4 }}>{icon}</span>
      <div className="font-semibold" style={{ fontSize: 16, color: 'var(--color-on-surface)' }}>{title}</div>
      {description && <p className="text-body-md" style={{ opacity: 0.7, maxWidth: 320 }}>{description}</p>}
    </div>
  );
}

/**
 * StreamProgressBar — Animated streaming progress indicator.
 */
export function StreamProgressBar({ messages = [] }) {
  return (
    <div className="glass-panel p-4" style={{ borderRadius: 12 }}>
      <div className="stream-bar mb-3" style={{ borderRadius: 9999 }} />
      {messages.map((msg, i) => (
        <p key={i} className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 6 }}>chevron_right</span>
          {msg}
        </p>
      ))}
    </div>
  );
}
