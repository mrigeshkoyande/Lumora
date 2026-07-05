import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';
import { StreamProgressBar } from '../components/ui/StatusComponents';

const TEMPLATES = [
  { id: 'dengue',    icon: 'water_drop', title: 'Monsoon Dengue Surge',  desc: 'Historical overlay based on 2022 high-rainfall season.' },
  { id: 'winter',   icon: 'ac_unit',    title: 'Winter Respiratory',     desc: 'Projected flu and RSV influx for dense urban populations.' },
  { id: 'custom',   icon: 'tune',       title: 'Custom Scenario',        desc: 'Manually define vectors, timeline, and affected areas.' },
];

const FACILITIES = ['District Hospital North', 'CHC Alpha', 'PHC Sector 4', 'East Wing Clinic', 'South Valley PHC'];

export default function SimulationPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('dengue');
  const [horizon, setHorizon] = useState(30);
  const [selectedFacilities, setSelectedFacilities] = useState(['District Hospital North', 'CHC Alpha', 'PHC Sector 4']);
  const [location, setLocation] = useState('Chennai, India');

  const { status, progress, result, weatherSnapshot, error, run } = useStreamAnalysis();

  const toggleFacility = (f) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleRun = () => {
    const timeFrame = `Next ${horizon} Days — ${TEMPLATES.find(t => t.id === selectedTemplate)?.title || 'Custom Scenario'}`;
    run(location, timeFrame);
  };

  const report = result?.report || null;

  return (
    <PageShell onLocationChange={setLocation} currentLocation={location}>
      <div style={{ paddingBottom: 32 }}>
        <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
          Simulation Engine
        </h2>
        <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: '0 0 24px' }}>
          Configure parameters to project facility stress and resource needs.
        </p>

        {/* Scenario Builder */}
        <div className="glass-panel" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
            <div>
              {/* Templates */}
              <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 14 }}>SELECT BASELINE TEMPLATE</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    id={`sim-template-${t.id}`}
                    onClick={() => setSelectedTemplate(t.id)}
                    style={{
                      background: selectedTemplate === t.id ? 'rgba(0,100,148,0.1)' : 'rgba(255,255,255,0.4)',
                      border: `2px solid ${selectedTemplate === t.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)'}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minWidth: 180,
                      transition: 'all 0.2s',
                    }}
                    aria-label={`Select ${t.title} template`}
                    aria-pressed={selectedTemplate === t.id}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: selectedTemplate === t.id ? 'var(--color-primary)' : 'var(--color-outline)', fontSize: 22 }}>
                        {t.icon}
                      </span>
                      {selectedTemplate === t.id && (
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 18 }}>check_circle</span>
                      )}
                    </div>
                    <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Facility selection */}
              <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 12 }}>TARGET FACILITIES (MULTI-SELECT)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {selectedFacilities.map((f) => (
                  <button
                    key={f}
                    id={`sim-facility-remove-${f.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleFacility(f)}
                    style={{
                      borderRadius: 9999,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      background: 'rgba(0,100,148,0.1)',
                      border: '1px solid rgba(0,100,148,0.2)',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    aria-label={`Remove ${f}`}
                  >
                    {f}
                    <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>×</span>
                  </button>
                ))}
                {FACILITIES.filter((f) => !selectedFacilities.includes(f)).slice(0, 1).map((f) => (
                  <button
                    key={f}
                    id={`sim-facility-add-${f.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleFacility(f)}
                    style={{
                      borderRadius: 9999,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: 'var(--color-outline)',
                      background: 'none',
                      border: '1px dashed var(--color-outline)',
                      cursor: 'pointer',
                    }}
                    aria-label={`Add ${f}`}
                  >
                    + Add more facilities...
                  </button>
                ))}
              </div>
            </div>

            {/* Time horizon + run button */}
            <div style={{ minWidth: 200 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.7)',
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 12 }}>TIME HORIZON</div>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <span className="tabular-nums" style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-primary)' }}>{horizon}</span>
                  <span style={{ fontSize: 20, color: 'var(--color-on-surface-variant)', marginLeft: 6 }}>Days</span>
                </div>
                <input
                  id="sim-horizon-slider"
                  type="range"
                  min={7}
                  max={90}
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  aria-label="Time horizon in days"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-outline)', marginTop: 4 }}>
                  <span>7D</span><span>90D</span>
                </div>
              </div>

              <button
                id="sim-run-btn"
                className="btn-primary"
                onClick={handleRun}
                disabled={status === 'streaming'}
                style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
                aria-label="Run simulation"
              >
                {status === 'streaming' ? (
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} />
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        {status === 'streaming' && (
          <div style={{ marginBottom: 20 }}>
            <StreamProgressBar messages={progress.slice(-4)} />
          </div>
        )}

        {/* Results */}
        {report && (
          <div className="glass-panel" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 22, margin: 0 }}>Simulation Results</h3>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, margin: '4px 0 0' }}>
                  {TEMPLATES.find(t => t.id === selectedTemplate)?.title} ({horizon} Day Projection)
                </p>
              </div>
              <button
                id="sim-export-btn"
                className="btn-ghost"
                style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', fontSize: 13 }}
                aria-label="Export simulation data"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Export Data
              </button>
            </div>

            {/* Summary */}
            {report.summary && (
              <div
                style={{
                  background: 'rgba(0,100,148,0.05)',
                  border: '1px solid rgba(0,100,148,0.15)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginBottom: 24,
                }}
              >
                <p style={{ color: 'var(--color-on-surface)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  {report.summary}
                </p>
              </div>
            )}

            {/* Trajectory comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div
                style={{
                  background: 'rgba(186,26,26,0.06)',
                  border: '1px solid rgba(186,26,26,0.15)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#ba1a1a' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>trending_up</span>
                  <span className="font-semibold" style={{ fontSize: 15 }}>Default Trajectory (Wait 5 Days)</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { label: 'Projected Breaches', val: report.flagged_centres?.length || 1240 },
                    { label: 'Est. Recovery', val: `${horizon > 20 ? 14 : 8} Days` },
                    { label: 'Impact Score', val: report.overall_risk_level || 'High', isRisk: true },
                  ].map(({ label, val, isRisk }) => (
                    <div key={label}>
                      <div
                        className="tabular-nums font-bold"
                        style={{ fontSize: 28, color: isRisk ? '#ba1a1a' : '#0B2545', lineHeight: 1 }}
                      >
                        {val}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(5,150,105,0.06)',
                  border: '1px solid rgba(5,150,105,0.15)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#059669' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shield</span>
                  <span className="font-semibold" style={{ fontSize: 15 }}>Intervention Trajectory (Act Now)</span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { label: 'Projected Breaches (-82%)', val: '215' },
                    { label: 'Est. Recovery', val: '3 Days' },
                    { label: 'Impact Score', val: 'Low', isGood: true },
                  ].map(({ label, val, isGood }) => (
                    <div key={label}>
                      <div
                        className="tabular-nums font-bold"
                        style={{ fontSize: 28, color: isGood ? '#059669' : '#0B2545', lineHeight: 1 }}
                      >
                        {val}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
