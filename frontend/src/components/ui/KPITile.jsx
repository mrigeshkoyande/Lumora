/**
 * KPITile — Dashboard metric tile with sparkline bars.
 * Matches the "District Command Dashboard" design exactly.
 */
export default function KPITile({ label, value, unit, trend, color, sparkData = [] }) {
  const colors = {
    error:     '#ba1a1a',
    secondary: '#00696e',
    primary:   '#006494',
    tertiary:  '#286769',
    amber:     '#d97706',
  };
  const tileColor = colors[color] || colors.primary;

  const trendIcon =
    trend === 'up'   ? 'trending_up' :
    trend === 'down' ? 'trending_down' : 'horizontal_rule';

  return (
    <div
      className="glass-card p-6 flex flex-col justify-between cursor-default group"
      style={{ height: 160 }}
      role="region"
      aria-label={`${label}: ${value}${unit || ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <span className="text-label-sm font-semibold" style={{ color: '#0B2545' }}>{label}</span>
        <span
          className="material-symbols-outlined transition-transform group-hover:scale-110"
          style={{ color: tileColor, fontSize: 20 }}
        >
          {trendIcon}
        </span>
      </div>

      {/* Value + Sparkline */}
      <div>
        <div
          className="tabular-nums leading-none mb-2"
          style={{ fontSize: 48, fontWeight: 700, color: '#0B2545' }}
        >
          {value}
          <span style={{ fontSize: 24, fontWeight: 600, opacity: 0.6 }}>{unit}</span>
        </div>

        {/* Sparkline bars */}
        {sparkData.length > 0 && (
          <div className="sparkline-bars" style={{ opacity: 0.7 }}>
            {sparkData.map((h, i) => (
              <div
                key={i}
                className="sparkline-bar"
                style={{
                  height: `${h}px`,
                  background: tileColor,
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
