import { useState, useEffect, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import KPITile from '../components/ui/KPITile';
import SeverityBadge from '../components/ui/SeverityBadge';
import { LoadingSpinner, ErrorCard, StreamProgressBar } from '../components/ui/StatusComponents';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';
import { snapshot, getHospitalCoverage } from '../api/client';

// Derive KPI data from the AI report
function deriveKPIs(report) {
  if (!report) {
    // Fallback/Initial mock KPIs
    return [
      {
        label: 'Stock-out incidence',
        value: 12,
        unit: '%',
        trend: 'up',
        color: 'error',
        sparkData: [6, 8, 10, 9, 12, 11, 14],
      },
      {
        label: 'Avg. OPD wait time',
        value: 45,
        unit: 'm',
        trend: 'down',
        color: 'secondary',
        sparkData: [8, 7, 6, 5, 4, 3, 2],
      },
      {
        label: 'Bed utilization',
        value: 88,
        unit: '%',
        trend: 'flat',
        color: 'primary',
        sparkData: [6, 7, 6, 7, 7, 6, 8],
      },
      {
        label: 'Reporting compliance',
        value: 94,
        unit: '%',
        trend: 'up',
        color: 'secondary',
        sparkData: [4, 5, 6, 7, 8, 8, 9],
      },
    ];
  }

  const flaggedCount = report.flagged_centres?.length || 0;
  const stockOuts = report.stock_out_warnings?.length || 0;
  const confidence = report.accuracy_confidence_score || 85;
  const risk = report.overall_risk_level || 'Moderate';

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
      value: risk.toUpperCase(),
      unit: '',
      trend: risk.toLowerCase() === 'high' ? 'up' : 'down',
      color: risk.toLowerCase() === 'high' ? 'error' : risk.toLowerCase() === 'moderate' ? 'amber' : 'secondary',
      sparkData: [10, 12, 14, 12, 16, 14, 18],
    },
    {
      label: 'AI Confidence',
      value: confidence,
      unit: '%',
      trend: 'up',
      color: 'secondary',
      sparkData: [60, 65, 70, 72, 75, 80, confidence].map((v) => Math.max(4, (v / 100) * 28)),
    },
  ];
}

// Derive intervention queue items from report
function deriveInterventions(report) {
  if (!report) {
    // Fallback/Mock Interventions matching the design HTML
    return [
      {
        id: 'fc-1',
        name: 'North District Hospital',
        issue: 'Critical Supply Shortage',
        riskScore: 92,
        severity: 'critical',
        icon: 'warning',
      },
      {
        id: 'fc-2',
        name: 'East Wing Clinic',
        issue: 'OPD Wait Time > 90m',
        riskScore: 74,
        severity: 'medium',
        icon: 'schedule',
      },
      {
        id: 'fc-3',
        name: 'South Valley PHC',
        issue: 'Report Overdue (48h)',
        riskScore: 65,
        severity: 'medium',
        icon: 'description',
      },
      {
        id: 'fc-4',
        name: 'Central City Dispensary',
        issue: 'Routine Check scheduled',
        riskScore: 28,
        severity: 'low',
        icon: 'check_circle',
      },
    ];
  }

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

  if (items.length === 0) {
    return [
      {
        id: 'fc-mock-1',
        name: 'Mock Health Outpost',
        issue: 'Report pending validation',
        riskScore: 35,
        severity: 'low',
        icon: 'info',
      }
    ];
  }

  return items.sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
}

// Derive underperformance flags from report
function deriveFlags(report) {
  if (!report) {
    // Fallback/Mock Flags matching the design HTML
    return [
      {
        id: 0,
        title: 'Inventory Deficit',
        description: '3 facilities reporting stock-outs of essential antibiotics.',
        action: 'Initiate Redistribution',
        color: '#ba1a1a',
        bg: 'rgba(186, 26, 26, 0.05)',
        border: 'rgba(186, 26, 26, 0.15)',
      },
      {
        id: 1,
        title: 'Staffing Imbalance',
        description: 'East wing running at 60% capacity during peak hours.',
        action: 'View Roster',
        color: '#286769',
        bg: 'rgba(40, 103, 105, 0.05)',
        border: 'rgba(40, 103, 105, 0.15)',
      },
      {
        id: 2,
        title: 'Data Lag',
        description: '2 rural centers haven\'t synced daily logs in 24 hours.',
        action: 'Send Alert',
        color: '#006494',
        bg: 'rgba(0, 100, 148, 0.05)',
        border: 'rgba(0, 100, 148, 0.15)',
      },
    ];
  }

  return (report.redistribution_recommendations || []).map((rec, i) => {
    const colors = ['#ba1a1a', '#d97706', '#006494', '#286769'];
    const color = colors[i % colors.length];
    return {
      id: i,
      title: rec.action_type || 'Redistribution Needed',
      description: rec.description || rec.recommendation || 'AI-recommended action',
      action: 'Initiate Action',
      color: color,
      bg: 'rgba(11, 37, 69, 0.02)',
      border: 'rgba(11, 37, 69, 0.08)',
    };
  });
}

export default function DashboardPage() {
  // Read initial location from sessionStorage or fallback
  const initialLoc = sessionStorage.getItem('onboarding_location') || 'Chennai, India';
  const initialTimeFrame = sessionStorage.getItem('onboarding_timeframe') || 'Current and Next 7 Days';
  
  const [location, setLocation] = useState(initialLoc);
  const [timeFrame, setTimeFrame] = useState(initialTimeFrame);
  const [activeTab, setActiveTab] = useState('map'); // map | grid
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Snapshot Weather & News states
  const [snapshotData, setSnapshotData] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // Hospital coverage state
  const [hospitalData, setHospitalData] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);

  // Stream analysis runner for changes
  const { status, progress, result, error, run } = useStreamAnalysis();

  // Load initial analysis report from sessionStorage if matching location
  const initialReport = useMemo(() => {
    try {
      const storedLoc = sessionStorage.getItem('onboarding_location');
      const storedReport = sessionStorage.getItem('onboarding_report');
      if (storedLoc === location && storedReport) {
        return JSON.parse(storedReport);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [location]);

  // Combined report logic
  const report = useMemo(() => {
    return result || initialReport;
  }, [result, initialReport]);

  // Fetch Snapshot & Hospital Data
  useEffect(() => {
    if (!location) return;
    setSnapshotLoading(true);
    snapshot(location)
      .then((data) => {
        setSnapshotData(data);
        setSnapshotLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch snapshot:', err);
        setSnapshotLoading(false);
      });
  }, [location]);

  useEffect(() => {
    setHospitalLoading(true);
    getHospitalCoverage()
      .then((data) => {
        setHospitalData(data);
        setHospitalLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch hospital data:', err);
        setHospitalLoading(false);
      });
  }, []);

  // When location changes in TopNavbar, run a new AI stream analysis
  const handleLocationChange = (newLoc) => {
    if (newLoc && newLoc.trim() !== location) {
      setLocation(newLoc.trim());
      run(newLoc.trim(), timeFrame);
    }
  };

  const kpis = useMemo(() => deriveKPIs(report), [report]);
  const interventions = useMemo(() => deriveInterventions(report), [report]);
  const flags = useMemo(() => deriveFlags(report), [report]);

  const weather = snapshotData?.weather_aqi || null;
  const news = snapshotData?.health_news || [];

  return (
    <PageShell onLocationChange={handleLocationChange} currentLocation={location}>
      <div style={{ paddingBottom: 32 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, paddingTop: 8 }}>
          <div>
            <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
              District Command
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
                Real-time operational overview
              </p>
              {weather && (
                <span className="page-title-badge" style={{ gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thermostat</span>
                  {weather.temperature != null ? `${weather.temperature.toFixed(1)}°C` : '--'}
                  {' · '}
                  {location}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons including the Detail Report */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              id="dashboard-detail-report-btn"
              className="btn-ghost"
              style={{
                padding: '8px 16px',
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                borderColor: 'var(--color-outline-variant)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-navy)',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              onClick={() => setShowDetailModal(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>article</span>
              Detail Report
            </button>
          </div>
        </div>

        {/* Streaming progress indicator */}
        {status === 'streaming' && (
          <div style={{ marginBottom: 24 }}>
            <StreamProgressBar messages={progress.slice(-3)} />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{ marginBottom: 24 }}>
            <ErrorCard
              message={error || 'Failed to update analysis. Is the backend running on port 8000?'}
              onRetry={() => run(location, timeFrame)}
            />
          </div>
        )}

        {/* KPI Tiles */}
        <section
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
        </section>

        {/* Main Content Split */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
            gap: 16,
            marginBottom: 24,
            alignItems: 'start',
          }}
          className="intervention-grid"
        >
          {/* Left Column: Intervention Queue */}
          <div className="glass-panel" style={{ padding: 24, minHeight: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, margin: 0 }}>
                Intervention Queue
              </h3>
              <button
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
                Filter
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interventions.map((item) => (
                <div
                  key={item.id}
                  className={`glass-row severity-${item.severity === 'critical' ? 'red' : item.severity === 'medium' ? 'amber' : 'green'}`}
                  style={{ padding: '16px 20px', cursor: 'pointer', borderLeftWidth: 4 }}
                  role="article"
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
                            fontSize: 16,
                            color: item.severity === 'critical' ? '#ba1a1a' : item.severity === 'medium' ? '#d97706' : '#059669',
                          }}
                        >
                          {item.icon}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: item.severity === 'critical' ? '#ba1a1a' : item.severity === 'medium' ? '#d97706' : '#059669',
                            fontWeight: 500
                          }}
                        >
                          {item.issue}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--color-outline)', fontWeight: 600, letterSpacing: '0.05em' }}>RISK SCORE</div>
                        <div
                          className="tabular-nums font-bold"
                          style={{
                            fontSize: 24,
                            color: item.severity === 'critical' ? '#ba1a1a' : item.severity === 'medium' ? '#d97706' : '#059669',
                          }}
                        >
                          {item.riskScore}
                        </div>
                      </div>
                      <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12, borderRadius: 9999 }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Territory View (Map/Grid) & Environmental Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Map/Grid Panel */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              
              {/* Tab Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(11, 37, 69, 0.08)' }}>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 16, margin: 0 }}>Territory View</h3>
                <div style={{ display: 'flex', background: 'var(--color-surface-container-low)', borderRadius: 20, padding: 3 }}>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`font-semibold`}
                    style={{
                      padding: '4px 14px',
                      fontSize: 12,
                      borderRadius: 16,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === 'map' ? '#ffffff' : 'transparent',
                      color: activeTab === 'map' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      boxShadow: activeTab === 'map' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setActiveTab('grid')}
                    className={`font-semibold`}
                    style={{
                      padding: '4px 14px',
                      fontSize: 12,
                      borderRadius: 16,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === 'grid' ? '#ffffff' : 'transparent',
                      color: activeTab === 'grid' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      boxShadow: activeTab === 'grid' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Grid
                  </button>
                </div>
              </div>

              {/* Tab Body */}
              <div style={{ padding: 16 }}>
                {activeTab === 'map' ? (
                  /* Map View (Default) */
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(58,181,255,0.1) 0%, rgba(0,105,110,0.05) 100%)',
                      borderRadius: 14,
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid rgba(11, 37, 69, 0.06)',
                    }}
                  >
                    {/* Stylized placeholder map overlay */}
                    <span className="material-symbols-outlined" style={{ position: 'absolute', top: '25%', left: '38%', color: 'rgba(0,100,148,0.15)', fontSize: 90 }}>
                      map
                    </span>
                    <div style={{ position: 'absolute', top: '35%', left: '55%', width: 12, height: 12, borderRadius: '50%', background: '#ba1a1a', border: '2px solid #fff', boxShadow: '0 0 10px rgba(186,26,26,0.6)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '35%', width: 10, height: 10, borderRadius: '50%', background: '#d97706', border: '2px solid #fff', boxShadow: '0 0 8px rgba(217,119,6,0.5)' }} />
                    <div style={{ position: 'absolute', top: '65%', left: '60%', width: 10, height: 10, borderRadius: '50%', background: '#059669', border: '2px solid #fff', boxShadow: '0 0 8px rgba(5,150,105,0.4)' }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(11, 37, 69, 0.08)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#0B2545', fontWeight: 500 }}>
                      📍 Currently displaying: {location}
                    </div>
                  </div>
                ) : (
                  /* Hospital Grid view (Real-time CSV data) */
                  <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid rgba(11, 37, 69, 0.06)', borderRadius: 12 }}>
                    {hospitalLoading ? (
                      <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-surface-container-low)', color: 'var(--color-navy)', borderBottom: '1px solid rgba(11, 37, 69, 0.08)', fontWeight: 600 }}>
                            <th style={{ padding: '10px 12px' }}>Zone</th>
                            <th style={{ padding: '10px 12px' }}>Hospitals</th>
                            <th style={{ padding: '10px 12px' }}>Beds</th>
                            <th style={{ padding: '10px 12px' }}>Ambulances</th>
                            <th style={{ padding: '10px 12px' }}>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hospitalData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(11, 37, 69, 0.05)', hover: { background: 'rgba(11, 37, 69, 0.02)' } }}>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-navy)' }}>{row.zone}</td>
                              <td style={{ padding: '10px 12px' }}>{row.hospitals}</td>
                              <td style={{ padding: '10px 12px' }}>{row.beds}</td>
                              <td style={{ padding: '10px 12px' }}>{row.ambulances}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ color: row.stock_availability < 50 ? '#ba1a1a' : row.stock_availability < 75 ? '#d97706' : '#059669', fontWeight: 'bold' }}>
                                  {row.stock_availability}%
                                </span>
                              </td>
                            </tr>
                          ))}
                          {hospitalData.length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ padding: 16, textAlign: 'center', color: 'var(--color-outline)' }}>No zone data loaded</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Environmental Data Card */}
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>air</span>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 16, margin: 0 }}>Environmental Signals</h3>
              </div>

              {snapshotLoading ? (
                <div style={{ textAlign: 'center', padding: '12px' }}><div className="spinner" /></div>
              ) : weather ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: 'rgba(11, 37, 69, 0.02)', border: '1px solid rgba(11, 37, 69, 0.06)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>thermostat</span>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--color-outline)', fontWeight: 700, letterSpacing: '0.05em' }}>TEMPERATURE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }}>{weather.temperature != null ? `${weather.temperature.toFixed(1)}°C` : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(11, 37, 69, 0.02)', border: '1px solid rgba(11, 37, 69, 0.06)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>wind_power</span>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--color-outline)', fontWeight: 700, letterSpacing: '0.05em' }}>WIND SPEED</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }}>{weather.wind_speed != null ? `${(weather.wind_speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(11, 37, 69, 0.02)', border: '1px solid rgba(11, 37, 69, 0.06)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>water_drop</span>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--color-outline)', fontWeight: 700, letterSpacing: '0.05em' }}>HUMIDITY</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-navy)' }}>{weather.humidity != null ? `${weather.humidity}%` : 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(11, 37, 69, 0.02)', border: '1px solid rgba(11, 37, 69, 0.06)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>masks</span>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--color-outline)', fontWeight: 700, letterSpacing: '0.05em' }}>AQI INDEX</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: weather.aqi_index >= 4 ? '#ba1a1a' : weather.aqi_index >= 3 ? '#d97706' : '#059669' }}>
                        {weather.aqi_index != null ? `${weather.aqi_index} - ${weather.aqi_label}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--color-outline)', fontSize: 13, fontStyle: 'italic' }}>No environmental data loaded</div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Section: Underperformance Flags & Latest News split */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            marginTop: 16,
          }}
        >
          {/* Underperformance Flags */}
          <div className="glass-panel animate-fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 24 }}>flag</span>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: 0 }}>Underperformance Flags</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  style={{
                    padding: 16,
                    background: flag.bg || 'rgba(11, 37, 69, 0.02)',
                    border: `1px solid ${flag.border || 'rgba(11, 37, 69, 0.08)'}`,
                    borderRadius: 16,
                  }}
                >
                  <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: flag.color }}>
                    {flag.title}
                  </h4>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                    {flag.description}
                  </p>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: flag.color,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {flag.action}
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Health News */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 24 }}>newspaper</span>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: 0 }}>Latest Health Intelligence News</h3>
            </div>

            {snapshotLoading ? (
              <div style={{ textAlign: 'center', padding: '24px' }}><div className="spinner" /></div>
            ) : news && news.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
                {news.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      background: '#ffffff',
                      border: '1px solid rgba(11, 37, 69, 0.06)',
                      borderRadius: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-navy)', lineHeight: 1.4 }}>
                        {item.title}
                      </h4>
                    </div>
                    {item.description && (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                        {item.description.slice(0, 120)}...
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--color-outline)', fontWeight: 600 }}>
                        {item.source} · {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
                      </span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 12,
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          Read Article
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--color-outline)', fontSize: 13, fontStyle: 'italic', padding: 24, textAlign: 'center' }}>
                No public health news found for {location}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 32 }}>
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

      {/* Detail Report Modal */}
      {showDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(11, 37, 69, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="glass-card-static"
            style={{
              width: '100%',
              maxWidth: 800,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: 32,
              boxShadow: '0 20px 48px rgba(11, 37, 69, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(11, 37, 69, 0.08)', paddingBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-navy)' }}>
                  AI Analysis Detail Report
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                  Detailed multi-agent diagnostic breakdown for <strong>{location}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  color: 'var(--color-outline)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {report ? (
                <>
                  {/* Executive Summary */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--color-navy)' }}>
                      Executive Summary
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                      {report.executive_summary || report.summary || 'No summary generated.'}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: 16, background: 'var(--color-surface-container-low)', borderRadius: 16, border: '1px solid rgba(11, 37, 69, 0.06)' }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--color-outline)', fontWeight: 600, display: 'block', letterSpacing: '0.04em' }}>ANALYSIS TIME</span>
                      <strong style={{ fontSize: 13, color: 'var(--color-navy)' }}>{timeFrame}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--color-outline)', fontWeight: 600, display: 'block', letterSpacing: '0.04em' }}>MODEL VERSION</span>
                      <strong style={{ fontSize: 13, color: 'var(--color-navy)' }}>Llama-3.1-8b-instant</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--color-outline)', fontWeight: 600, display: 'block', letterSpacing: '0.04em' }}>CONFIDENCE SCORE</span>
                      <strong style={{ fontSize: 13, color: 'var(--color-green)' }}>{report.accuracy_confidence_score || 85}%</strong>
                    </div>
                  </div>

                  {/* Raw Report Details */}
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--color-navy)' }}>
                      Raw LLM Report JSON Payload
                    </h4>
                    <pre
                      style={{
                        margin: 0,
                        padding: 16,
                        background: '#0B2545',
                        color: '#8ecdff',
                        borderRadius: 12,
                        fontSize: 12,
                        fontFamily: 'var(--font-family-mono)',
                        overflowX: 'auto',
                        maxHeight: 250,
                      }}
                    >
                      {JSON.stringify(report, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-outline)' }}>
                  No active AI analysis report found. Initializing a new query from the onboarding configuration is recommended.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(11, 37, 69, 0.08)', paddingTop: 16, marginTop: 8 }}>
              <button
                className="btn-primary"
                style={{ padding: '8px 24px', borderRadius: 12 }}
                onClick={() => setShowDetailModal(false)}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid css helper */}
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
