import { useState } from 'react';
import PageShell from '../components/layout/PageShell';

const WARDS = [
  { name: 'General Ward',   total: 40, occupied: 34, color: '#006494' },
  { name: 'Maternity Ward', total: 20, occupied: 18, color: '#00696e' },
  { name: 'Specialty Ward', total: 60, occupied: 46, color: '#286769' },
];

const NEARBY = [
  { name: "St. Mary's CHC",  dist: '3km',  beds: 12, tag: 'AI BEST MATCH', tagColor: 'var(--color-secondary)' },
  { name: 'Hilltop PHC',     dist: '5km',  beds: 4,  tag: null },
  { name: 'City Gen Hospital',dist: '12km', beds: 0,  tag: 'FULL', tagColor: '#ba1a1a' },
];

function BedGrid({ total, occupied, color }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{ color: i < occupied ? color : `${color}30`, fontSize: 22 }}
          title={i < occupied ? 'Occupied' : 'Available'}
        >
          bed
        </span>
      ))}
    </div>
  );
}

export default function BedManagementPage() {
  const totalBeds  = WARDS.reduce((s, w) => s + w.total, 0);
  const totalOcc   = WARDS.reduce((s, w) => s + w.occupied, 0);
  const totalAvail = totalBeds - totalOcc;

  return (
    <PageShell>
      <div style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
              Bed Management
            </h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Real-time occupancy and referral network
            </p>
          </div>
          {/* KPI strip */}
          <div className="flex flex-wrap gap-5 items-center">
            {[
              { label: 'Total Beds', val: totalBeds, color: '#0B2545' },
              { label: 'Occupied',   val: totalOcc,  color: '#ba1a1a' },
              { label: 'Available',  val: totalAvail, color: '#059669' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</div>
                <div className="tabular-nums font-bold" style={{ fontSize: 28, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Ward Grids */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {WARDS.map((w) => (
              <div key={w.name} className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-semibold" style={{ color: w.color, fontSize: 18, margin: 0 }}>{w.name}</h3>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      borderRadius: 9999,
                      padding: '4px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0B2545',
                    }}
                  >
                    {w.occupied}/{w.total} Occupied
                  </span>
                </div>
                <BedGrid total={w.total} occupied={w.occupied} color={w.color} />
              </div>
            ))}
          </div>

          {/* Nearby Facilities Sidebar */}
          <div className="glass-panel lg:col-span-4" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 20 }}>
                my_location
              </span>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: 0 }}>Nearby Facilities</h3>
            </div>

            <button
              id="beds-request-ai-recommendation-btn"
              className="btn-ghost"
              style={{ width: '100%', padding: '10px', fontSize: 13, marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}
              aria-label="Request AI recommendation for bed referral"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>psychology</span>
              Request AI Recommendation
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {NEARBY.map((f) => (
                <div
                  key={f.name}
                  className="glass-row"
                  style={{ padding: '14px 16px' }}
                  role="article"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      {f.tag && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: f.tagColor || 'var(--color-primary)',
                            marginBottom: 4,
                          }}
                        >
                          {f.tag}
                        </div>
                      )}
                      <div className="font-semibold" style={{ color: '#0B2545', fontSize: 15 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', display: 'flex', gap: 4, alignItems: 'center', marginTop: 3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                        {f.dist} away
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Beds</div>
                      <div
                        className="tabular-nums font-bold"
                        style={{ fontSize: 22, color: f.beds === 0 ? '#ba1a1a' : '#059669' }}
                      >
                        {f.beds}
                      </div>
                    </div>
                  </div>
                  <button
                    id={`beds-referral-${f.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={f.beds === 0 ? 'btn-ghost' : 'btn-ghost'}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: 13,
                      borderRadius: 8,
                      opacity: f.beds === 0 ? 0.5 : 1,
                    }}
                    disabled={f.beds === 0}
                    aria-label={`Request referral to ${f.name}`}
                  >
                    {f.beds === 0 ? 'Full Capacity' : 'Request Referral'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bed-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageShell>
  );
}
