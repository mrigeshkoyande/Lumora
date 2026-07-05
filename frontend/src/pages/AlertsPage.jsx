import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import SeverityBadge from '../components/ui/SeverityBadge';
import { EmptyState } from '../components/ui/StatusComponents';
import { useAnalysis } from '../hooks/useAnalysis';

const DEFAULT_LOCATION = 'Chennai, India';

const MOCK_ALERTS = [
  {
    id: 'a1', icon: 'medication', title: 'Stock-out Risk: Paracetamol 500mg',
    facility: 'Central Hospital East', severity: 'critical', time: '10:42 AM',
    status: 'new', domain: 'Stock',
  },
  {
    id: 'a2', icon: 'bed', title: 'ICU Bed Capacity at 85%',
    facility: 'North Wing Clinic', severity: 'medium', time: '09:15 AM',
    status: 'new', domain: 'Bed Availability',
  },
  {
    id: 'a3', icon: 'group', title: 'Shift swap request pending approval',
    facility: 'Central Hospital East', severity: 'low', time: 'Yesterday, 14:30',
    status: 'acknowledged', domain: 'Staffing',
  },
  {
    id: 'a4', icon: 'coronavirus', title: 'Unusual spike in respiratory cases detected',
    facility: 'Region 4 Public Health', severity: 'critical', time: 'Yesterday, 08:00',
    status: 'new', domain: 'Public Health',
  },
];

const DOMAINS = ['Stock', 'Bed Availability', 'Staffing', 'Footfall', 'Public Health'];
const SEVERITIES = ['critical', 'medium', 'low'];
const STATUSES = ['new', 'acknowledged', 'resolved'];

const ICON_MAP = {
  medication: 'medication', bed: 'bed', group: 'group', coronavirus: 'coronavirus',
};

export default function AlertsPage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [selectedDomains, setSelectedDomains] = useState(new Set(['Stock', 'Bed Availability', 'Staffing']));
  const [selectedSeverity, setSelectedSeverity] = useState(new Set(SEVERITIES));
  const [selectedStatus, setSelectedStatus] = useState(new Set(['new']));
  const [push, setPush] = useState(true);
  const [emailPref, setEmailPref] = useState(true);
  const [sms, setSms] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState('all');

  const { data } = useAnalysis(location);

  // Build alerts from AI data + mock
  const aiAlerts = [];
  (data?.report?.stock_out_warnings || []).forEach((w, i) => {
    aiAlerts.push({
      id: `ai-sw-${i}`,
      icon: 'medication',
      title: `AI Alert: ${w.medicine_name || 'Medicine'} stock-out risk`,
      facility: `${location} District`,
      severity: (w.days_remaining || 10) < 7 ? 'critical' : 'medium',
      time: 'Just now',
      status: 'new',
      domain: 'Stock',
    });
  });
  (data?.report?.flagged_centres || []).forEach((fc, i) => {
    aiAlerts.push({
      id: `ai-fc-${i}`,
      icon: 'local_hospital',
      title: `${fc.centre_name || 'Health Centre'} flagged`,
      facility: fc.centre_name || `Centre ${i + 1}`,
      severity: fc.risk_score > 70 ? 'critical' : 'medium',
      time: 'Just now',
      status: 'new',
      domain: 'Public Health',
    });
  });

  const allAlerts = [...aiAlerts, ...MOCK_ALERTS];

  const filtered = allAlerts.filter((a) => {
    if (!selectedDomains.has(a.domain)) return false;
    if (!selectedSeverity.has(a.severity)) return false;
    if (!selectedStatus.has(a.status)) return false;
    if (facilityFilter !== 'all' && !a.facility.includes(facilityFilter)) return false;
    return true;
  });

  const toggle = (set, setter, key) => {
    const s = new Set(set);
    s.has(key) ? s.delete(key) : s.add(key);
    setter(s);
  };

  const severityColor = { critical: '#ba1a1a', medium: '#d97706', low: '#059669' };
  const iconBg = { critical: 'rgba(186,26,26,0.1)', medium: 'rgba(217,119,6,0.1)', low: 'rgba(5,150,105,0.1)' };

  const Switch = ({ on, onClick, id }) => (
    <div id={id} className={`switch-track ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on}>
      <div className="switch-thumb" />
    </div>
  );

  return (
    <PageShell onLocationChange={setLocation} currentLocation={location}>
      <div style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
              Alerts &amp; Notifications
            </h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Manage and review system-generated events across facilities.
            </p>
          </div>
          <button
            id="alerts-mark-all-read-btn"
            className="btn-ghost"
            style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
            aria-label="Mark all alerts as read"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>done_all</span>
            Mark all as read
          </button>
        </div>

        {/* Delivery Preferences */}
        <div
          className="glass-panel"
          style={{ padding: '14px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>tune</span>
            <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>DELIVERY PREFERENCES</span>
          </div>
          {[
            { label: 'Push', on: push, set: setPush, id: 'alerts-pref-push' },
            { label: 'Email', on: emailPref, set: setEmailPref, id: 'alerts-pref-email' },
            { label: 'SMS', on: sms, set: setSms, id: 'alerts-pref-sms' },
          ].map(({ label, on, set, id }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-medium" style={{ fontSize: 14, color: '#0B2545' }}>{label}</span>
              <Switch on={on} onClick={() => set(!on)} id={id} />
            </div>
          ))}
        </div>

        {/* Layout: Filters + Alerts List */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
          {/* Filter Sidebar */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 16 }}>FILTERS</div>

            {/* Facility */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14, marginBottom: 10 }}>Facility</div>
              <select
                id="alerts-facility-filter"
                className="glass-input"
                style={{ borderRadius: 10, padding: '8px 12px', fontSize: 14 }}
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                aria-label="Filter by facility"
              >
                <option value="all">All Facilities</option>
                <option value="Central Hospital East">Central Hospital East</option>
                <option value="North Wing Clinic">North Wing Clinic</option>
                <option value="Region 4">Region 4 Public Health</option>
              </select>
            </div>

            {/* Domain */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14, marginBottom: 10 }}>Domain</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DOMAINS.map((d) => (
                  <label
                    key={d}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-on-surface)' }}
                  >
                    <input
                      id={`alerts-domain-${d.toLowerCase().replace(/\s+/g, '-')}`}
                      type="checkbox"
                      checked={selectedDomains.has(d)}
                      onChange={() => toggle(selectedDomains, setSelectedDomains, d)}
                      style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      aria-label={`Filter by ${d}`}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div style={{ marginBottom: 20 }}>
              <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14, marginBottom: 10 }}>Severity</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    id={`alerts-severity-${s}`}
                    onClick={() => toggle(selectedSeverity, setSelectedSeverity, s)}
                    style={{
                      borderRadius: 9999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${selectedSeverity.has(s) ? severityColor[s] : 'var(--color-outline-variant)'}`,
                      background: selectedSeverity.has(s) ? `rgba(${s === 'critical' ? '186,26,26' : s === 'medium' ? '217,119,6' : '5,150,105'},0.1)` : 'transparent',
                      color: selectedSeverity.has(s) ? severityColor[s] : 'var(--color-outline)',
                      transition: 'all 0.2s',
                    }}
                    aria-label={`Filter ${s} severity`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14, marginBottom: 10 }}>Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    id={`alerts-status-${s}`}
                    onClick={() => toggle(selectedStatus, setSelectedStatus, s)}
                    style={{
                      borderRadius: 9999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--color-outline-variant)',
                      background: selectedStatus.has(s) ? 'var(--color-primary)' : 'transparent',
                      color: selectedStatus.has(s) ? 'white' : 'var(--color-on-surface-variant)',
                      transition: 'all 0.2s',
                    }}
                    aria-label={`Filter ${s} status`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon="notifications_off"
                title="No alerts match your filters"
                description="Try adjusting your domain, severity, or status filters."
              />
            ) : (
              filtered.map((alert) => (
                <div
                  key={alert.id}
                  className="glass-row"
                  style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}
                  role="article"
                  aria-label={`Alert: ${alert.title}`}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: iconBg[alert.severity],
                      border: `2px solid ${severityColor[alert.severity]}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: severityColor[alert.severity], fontSize: 20 }}>
                      {alert.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold" style={{ color: '#0B2545', fontSize: 15, marginBottom: 4 }}>
                      {alert.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-outline)' }}>
                        {alert.domain === 'Stock' ? 'medication' : 'location_on'}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>{alert.facility}</span>
                      <span style={{ fontSize: 12, color: severityColor[alert.severity], fontWeight: 600 }}>
                        • {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: 13, color: 'var(--color-outline)', flexShrink: 0, textAlign: 'right' }}>
                    {alert.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .alerts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageShell>
  );
}
