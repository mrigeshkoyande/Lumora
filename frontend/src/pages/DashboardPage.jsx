import { useState, useEffect, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import KPITile from '../components/ui/KPITile';
import SeverityBadge from '../components/ui/SeverityBadge';
import { LoadingSpinner, ErrorCard, StreamProgressBar } from '../components/ui/StatusComponents';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';

const DEFAULT_LOCATION = 'Chennai, India';

// Derive KPI data from the AI report
function deriveKPIs(report) {
  if (!report) return [];
  const flaggedCount = report.flagged_centres?.length || 0;
  const stockOuts = report.stock_out_warnings?.length || 0;
  const confidence = report.accuracy_confidence_score || 0;
  const risk = report.overall_risk_level || 'unknown';

  return [
    {
      label: 'Stock-out Warnings',
      value: stockOuts,
      unit: '',
      trend: stockOuts > 2 ? 'up' : 'down',
      color: stockOuts > 2 ? 'error' : 'secondary',
      sparkData: [6, 8, 10, 9, 12, 11, stockOuts + 2].map((v) => Math.max(4, v * 2)),
    },
    {
      label: 'Flagged Centres',
      value: flaggedCount,
      unit: '',
      trend: flaggedCount > 1 ? 'up' : 'down',
      color: flaggedCount > 2 ? 'error' : 'amber',
      sparkData: [3, 4, 3, 5, 4, flaggedCount, flaggedCount + 1].map((v) => Math.max(4, v * 4)),
    },
    {
      label: 'Risk Level',
      value: risk === 'High' ? 'HIGH' : risk === 'Moderate' ? 'MOD' : 'LOW',
      unit: '',
      trend: risk === 'High' ? 'up' : 'down',
      color: risk === 'High' ? 'error' : risk === 'Moderate' ? 'amber' : 'secondary',
      sparkData: [10, 12, 14, 12, 16, 14, 18].map((v) => v),
    },
    {
      label: 'AI Confidence',
      value: Math.round(confidence * 100),
      unit: '%',
      trend: 'up',
      color: 'secondary',
      sparkData: [60, 65, 70, 72, 75, 80, Math.round(confidence * 100)].map((v) => Math.max(4, (v / 100) * 28)),
    },
  ];
}

// Derive intervention queue items from report
function deriveInterventions(report) {
  if (!report) return [];
  const items = [];

  (report.flagged_centres || []).forEach((centre, i) => {
    items.push({
      id: `fc-${i}`,
      name: centre.centre_name || `Health Centre ${i + 1}`,
      issue: centre.issue_type || 'Flagged for review',
      riskScore: centre.risk_score || Math.floor(Math.random() * 50 + 40),
      severity: centre.risk_score > 70 ? 'critical' : centre.risk_score > 45 ? 'medium' : 'low',
      icon: 'warning',
    });
  });

  (report.stock_out_warnings || []).forEach((w, i) => {
    items.push({
      id: `sw-${i}`,
      name: w.medicine_name || `Medicine ${i + 1}`,
      issue: `Stock-out risk: ${w.days_remaining || '?'} days remaining`,
      riskScore: Math.max(10, 90 - (w.days_remaining || 5) * 5),
      severity: (w.days_remaining || 5) < 7 ? 'critical' : (w.days_remaining || 5) < 14 ? 'medium' : 'low',
      icon: 'medication',
    });
  });

  return items.sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
}

// Derive underperformance flags from report
function deriveFlags(report) {
  if (!report) return [];
  return (report.redistribution_recommendations || []).map((rec, i) => ({
    id: i,
    title: rec.action_type || 'Redistribution',
    description: rec.description || rec.recommendation || 'AI-recommended action',
    action: 'View Details →',
    color: i === 0 ? '#ba1a1a' : i === 1 ? '#d97706' : '#006494',
  }));
}

export default function DashboardPage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const { status, progress, weatherSnapshot, result, error, run } = useStreamAnalysis();

  // Auto-run on mount + location change
  useEffect(() => {
    run(location);
  }, [location]);

  const report = result?.report || null;
  const kpis = useMemo(() => deriveKPIs(report), [report]);
  const interventions = useMemo(() => deriveInterventions(report), [report]);
  const flags = useMemo(() => deriveFlags(report), [report]);

  const isLoading = status === 'idle' || status === 'streaming';

  return (
    <PageShell
      onLocationChange={setLocation}
      currentLocation={location}
    >
      <div style={{ paddingBottom: 32 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 24, paddingTop: 8 }}>
          <h2
            className="text-headline-lg"
            style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}
          >
            District Command
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Real-time operational overview
            </p>
            {weatherSnapshot && (
              <span
                className="page-title-badge"
                style={{ gap: 4 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thermostat</span>
                {weatherSnapshot.temperature?.celsius
                  ? `${weatherSnapshot.temperature.celsius.toFixed(1)}°C`
                  : 'Weather loaded'}
                · {location}
              </span>
            )}
          </div>
        </div>

        {/* Streaming progress */}
        {status === 'streaming' && (
          <div style={{ marginBottom: 24 }}>
            <StreamProgressBar messages={progress.slice(-3)} />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{ marginBottom: 24 }}>
            <ErrorCard
              message={error || 'Failed to analyze. Is the backend running on port 8000?'}
              onRetry={() => run(location)}
            />
          </div>
        )}

        {/* KPI Tiles */}
        {isLoading && !report ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card"
                style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className="spinner" />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {kpis.map((kpi, i) => (
              <KPITile key={i} {...kpi} />
            ))}
          </div>
        )}

        {/* Main Body: Intervention Queue + Territory View */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
            gap: 16,
            marginBottom: 16,
            alignItems: 'start',
          }}
          className="intervention-grid"
        >
          {/* Intervention Queue */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, margin: 0 }}>
                Intervention Queue
              </h3>
              <button
                id="dashboard-filter-btn"
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}
                aria-label="Filter intervention queue"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
                Filter
              </button>
            </div>

            {isLoading && !report ? (
              <LoadingSpinner message="Fetching intervention data..." />
            ) : interventions.length === 0 && status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#059669', display: 'block', marginBottom: 8 }}>check_circle</span>
                <p className="font-semibold">All centres operating normally</p>
                <p style={{ fontSize: 14, opacity: 0.7 }}>No interventions required at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {interventions.map((item) => (
                  <div
                    key={item.id}
                    className={`glass-row severity-${item.severity}`}
                    style={{ padding: '16px 20px', cursor: 'pointer' }}
                    role="article"
                    aria-label={`Intervention: ${item.name}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="font-semibold" style={{ color: '#0B2545', fontSize: 15, marginBottom: 4 }}>
                          {item.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14,
                              color: item.severity === 'critical' ? '#ba1a1a' : item.severity === 'medium' ? '#d97706' : '#059669',
                            }}
                          >
                            {item.icon}
                          </span>
                          <span style={{ fontSize: 13, color: item.severity === 'critical' ? '#ba1a1a' : item.severity === 'medium' ? '#d97706' : '#059669', fontWeight: 500 }}>
                            {item.issue}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div>
                          <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 2 }}>RISK SCORE</div>
                          <div
                            className="tabular-nums font-bold"
                            style={{
                              fontSize: 28,
                              color: item.riskScore > 70 ? '#ba1a1a' : item.riskScore > 45 ? '#d97706' : '#059669',
                            }}
                          >
                            {item.riskScore}
                          </div>
                        </div>
                        <button
                          id={`intervention-detail-${item.id}`}
                          className="btn-ghost"
                          style={{ padding: '5px 12px', fontSize: 12 }}
                          aria-label={`View details for ${item.name}`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Territory View / Weather */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, margin: 0 }}>Territory View</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button id="territory-map-btn" className="btn-primary" style={{ padding: '5px 14px', fontSize: 12, borderRadius: 8 }}>Map</button>
                <button id="territory-grid-btn" className="btn-ghost" style={{ padding: '5px 14px', fontSize: 12 }}>Grid</button>
              </div>
            </div>

            {/* Map placeholder with weather overlay */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(58,181,255,0.15) 0%, rgba(0,105,110,0.1) 100%)',
                borderRadius: 14,
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
              role="img"
              aria-label="Territory map placeholder"
            >
              <span
                className="material-symbols-outlined"
                style={{ position: 'absolute', top: '30%', left: '40%', color: 'rgba(0,100,148,0.3)', fontSize: 80 }}
              >
                map
              </span>
              {/* Mock risk dots */}
              <div style={{ position: 'absolute', top: '35%', left: '55%', width: 12, height: 12, borderRadius: '50%', background: '#ba1a1a', boxShadow: '0 0 12px rgba(186,26,26,0.6)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '35%', width: 10, height: 10, borderRadius: '50%', background: '#d97706', boxShadow: '0 0 10px rgba(217,119,6,0.5)' }} />
              <div style={{ position: 'absolute', top: '60%', left: '60%', width: 8, height: 8, borderRadius: '50%', background: '#059669', boxShadow: '0 0 8px rgba(5,150,105,0.4)' }} />
              <div style={{ position: 'absolute', top: '25%', left: '25%', width: 8, height: 8, borderRadius: '50%', background: '#d97706', boxShadow: '0 0 8px rgba(217,119,6,0.4)' }} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 12,
                  right: 12,
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: '#0B2545',
                  fontWeight: 500,
                }}
              >
                📍 {location}
              </div>
            </div>

            {/* Weather snapshot */}
            {weatherSnapshot && (
              <div style={{ marginTop: 16 }}>
                <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 10 }}>ENVIRONMENTAL DATA</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    {
                      icon: 'thermostat',
                      label: 'Temperature',
                      value: weatherSnapshot.temperature?.celsius != null
                        ? `${weatherSnapshot.temperature.celsius.toFixed(1)}°C`
                        : '—',
                    },
                    {
                      icon: 'water_drop',
                      label: 'Humidity',
                      value: weatherSnapshot.humidity != null ? `${weatherSnapshot.humidity}%` : '—',
                    },
                    {
                      icon: 'air',
                      label: 'Wind',
                      value: weatherSnapshot.wind_speed_kph != null ? `${weatherSnapshot.wind_speed_kph} km/h` : '—',
                    },
                    {
                      icon: 'masks',
                      label: 'AQI',
                      value: weatherSnapshot.aqi_us_standard != null ? String(weatherSnapshot.aqi_us_standard) : '—',
                    },
                  ].map(({ icon, label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 18 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--color-outline)', fontWeight: 600, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
                        <div className="font-semibold tabular-nums" style={{ fontSize: 14, color: '#0B2545' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Summary */}
        {report && (
          <div className="glass-panel" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--color-primary)', fontSize: 22 }}>psychology</span>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: 0 }}>AI Situational Summary</h3>
              </div>
              <button
                id="dashboard-collapse-flags-btn"
                className="btn-ghost"
                style={{ padding: '5px 12px', fontSize: 12 }}
                aria-label="Collapse AI summary"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
              </button>
            </div>

            {report.summary && (
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 20, lineHeight: 1.7 }}>
                {report.summary}
              </p>
            )}

            {/* Underperformance flags */}
            {flags.length > 0 && (
              <>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 20 }}>flag</span>
                  <span className="font-semibold" style={{ color: '#0B2545', fontSize: 16 }}>Underperformance Flags</span>
                </div>
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}
                >
                  {flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="glass-row"
                      style={{ padding: '16px 18px', borderLeft: `4px solid ${flag.color}`, borderRadius: 12 }}
                    >
                      <div
                        className="font-semibold text-label-sm"
                        style={{ color: flag.color, marginBottom: 6, letterSpacing: '0.04em' }}
                      >
                        {flag.title}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 10, lineHeight: 1.5 }}>
                        {flag.description}
                      </p>
                      <button
                        id={`flag-action-${flag.id}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: flag.color,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        aria-label={`Take action on ${flag.title}`}
                      >
                        {flag.action}
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>
            © 2024 Arogya OS. All rights reserved. ·{' '}
            <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Privacy Policy</a>
            {' · '}
            <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Terms of Service</a>
            {' · '}
            <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Security Compliance</a>
          </p>
        </div>
      </div>

      {/* Responsive grid fix */}
      <style>{`
        @media (max-width: 900px) {
          .intervention-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageShell>
  );
}
