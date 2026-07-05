/**
 * SeverityBadge — Pill badge for Critical / Medium / Low / Unknown severity.
 */
export default function SeverityBadge({ level, size = 'sm' }) {
  const configs = {
    critical: { label: 'Critical', bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a', border: 'rgba(186,26,26,0.25)' },
    high:     { label: 'High',     bg: 'rgba(186,26,26,0.08)', color: '#ba1a1a', border: 'rgba(186,26,26,0.2)' },
    medium:   { label: 'Medium',   bg: 'rgba(217,119,6,0.1)',  color: '#d97706', border: 'rgba(217,119,6,0.25)' },
    moderate: { label: 'Moderate', bg: 'rgba(217,119,6,0.08)', color: '#d97706', border: 'rgba(217,119,6,0.2)' },
    low:      { label: 'Low',      bg: 'rgba(5,150,105,0.1)',  color: '#059669', border: 'rgba(5,150,105,0.25)' },
    unknown:  { label: 'Unknown',  bg: 'rgba(111,120,130,0.1)', color: '#6f7882', border: 'rgba(111,120,130,0.2)' },
  };

  const key = level?.toLowerCase() || 'unknown';
  const cfg = configs[key] || configs.unknown;

  return (
    <span
      className="inline-flex items-center font-semibold"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 9999,
        padding: size === 'sm' ? '2px 10px' : '4px 14px',
        fontSize: size === 'sm' ? 11 : 13,
        letterSpacing: '0.04em',
      }}
    >
      {cfg.label}
    </span>
  );
}

/**
 * RiskLevel — Colored risk level text (not pill).
 */
export function RiskLevel({ level }) {
  const cfg = {
    high:     { label: 'HIGH',     color: '#ba1a1a' },
    moderate: { label: 'MODERATE', color: '#d97706' },
    medium:   { label: 'MEDIUM',   color: '#d97706' },
    low:      { label: 'LOW',      color: '#059669' },
    unknown:  { label: 'UNKNOWN',  color: '#6f7882' },
  };
  const key = level?.toLowerCase() || 'unknown';
  const c = cfg[key] || cfg.unknown;
  return (
    <span style={{ color: c.color, fontWeight: 700, letterSpacing: '0.06em', fontSize: 13 }}>
      {c.label}
    </span>
  );
}
