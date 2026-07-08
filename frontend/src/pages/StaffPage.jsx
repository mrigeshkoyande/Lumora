import { useState } from 'react';
import PageShell from '../components/layout/PageShell';

const STAFF = [
  { initials: 'AJ', name: 'Dr. Arjun Jha',   role: 'Medical Officer', status: 'present', checkin: '07:42 AM', color: '#3ab5ff' },
  { initials: 'SM', name: 'Sarah Miller',     role: 'Senior Nurse',   status: 'present', checkin: '06:55 AM', color: '#64d7df' },
  { initials: 'DK', name: 'David Kim',        role: 'Lab Technician', status: 'absent',  checkin: '--:--',    color: '#bec8d2' },
  { initials: 'LP', name: 'Linda Patel',      role: 'Nurse',          status: 'on-leave', checkin: 'Scheduled', color: '#8ecdff' },
  { initials: 'RJ', name: 'Dr. Rachel Jones', role: 'Surgeon',        status: 'present', checkin: '08:15 AM', color: '#94d1d3' },
  { initials: 'MK', name: 'Maya Kapoor',      role: 'Medical Officer', status: 'present', checkin: '08:00 AM', color: '#3ab5ff' },
  { initials: 'PT', name: 'Priya Thomas',     role: 'Nurse',          status: 'present', checkin: '07:15 AM', color: '#64d7df' },
];

const ROLES = ['All Roles', 'Medical Officer', 'Nurse', 'Technician'];
const SHORTAGES = [
  { title: 'ICU Night Nurses',    tag: 'RECURRING', tagColor: '#ba1a1a' },
  { title: 'Radiologists',        tag: 'REVIEW',    tagColor: '#d97706' },
];
const REDEPLOYMENTS = [
  {
    title: 'Technician Vacancy', severity: 'Critical - St. Jude',
    desc: 'Suggest redeploying M. Chen from North Wing (Low volume currently). 0.5km away.',
    btnLabel: 'Approve Move',
  },
  {
    title: 'Triage Nurse Gap', severity: 'Moderate - Main ER',
    desc: 'Suggest calling in K. Smith (On-call status). ETA 25 mins.',
    btnLabel: 'Send Request',
  },
];

const STATUS_COLORS = { present: '#059669', absent: '#ba1a1a', 'on-leave': '#d97706' };
const STATUS_LABELS = { present: 'Present', absent: 'Absent', 'on-leave': 'On Leave' };

export default function StaffPage() {
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [searchVal, setSearchVal] = useState('');

  const total  = STAFF.length;
  const present = STAFF.filter(s => s.status === 'present').length;
  const onLeave = STAFF.filter(s => s.status === 'on-leave').length;
  const gaps   = 9;

  const filtered = STAFF.filter((s) => {
    const matchRole = roleFilter === 'All Roles' || s.role === roleFilter;
    const matchSearch = !searchVal || s.name.toLowerCase().includes(searchVal.toLowerCase()) || s.role.toLowerCase().includes(searchVal.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <PageShell>
      <div style={{ paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
              Staff &amp; Attendance
            </h2>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 18 }}
            >
              search
            </span>
            <input
              id="staff-search-input"
              type="text"
              placeholder="Search staff..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="glass-input"
              style={{ borderRadius: 9999, paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, width: 220, fontSize: 14 }}
              aria-label="Search staff"
            />
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'TOTAL STAFF',   icon: 'group',         val: total,   sub: '+2 this week', color: '#0B2545' },
            { label: 'PRESENT TODAY', icon: 'person_check',  val: present, sub: `${Math.round(present/total*100)}% attendance rate`, color: '#006494' },
            { label: 'ON LEAVE',      icon: 'calendar_today', val: onLeave, sub: '5 pending requests', color: '#d97706' },
            { label: 'COVERAGE GAPS', icon: 'warning',       val: gaps,    sub: 'Critical in ICU & ER', color: '#ba1a1a' },
          ].map(({ label, icon, val, sub, color }) => (
            <div key={label} className="glass-card-static" style={{ padding: '20px 24px', borderTop: `3px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</span>
                <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>{icon}</span>
              </div>
              <div className="tabular-nums font-bold" style={{ fontSize: 36, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Roster Table */}
          <div className="glass-panel lg:col-span-8" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: 0 }}>Staff Roster</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ROLES.map((r) => (
                  <button
                    key={r}
                    id={`staff-role-${r.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setRoleFilter(r)}
                    className={roleFilter === r ? 'btn-primary' : 'btn-ghost'}
                    style={{ padding: '6px 14px', fontSize: 12, borderRadius: 9999 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr',
                padding: '10px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
              }}
              role="rowheader"
            >
              {['STAFF MEMBER', 'ROLE', 'STATUS', 'CHECK-IN TIME'].map((h) => (
                <span key={h} className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{h}</span>
              ))}
            </div>

            {filtered.map((s) => (
              <div
                key={s.name}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.2fr 1fr 1fr',
                  padding: '14px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#0B2545',
                      flexShrink: 0,
                    }}
                  >
                    {s.initials}
                  </div>
                  <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14 }}>{s.name}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>{s.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={`status-dot ${s.status}`} />
                  <span style={{ fontSize: 13, color: STATUS_COLORS[s.status], fontWeight: 600 }}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 14, color: s.checkin === '--:--' ? 'var(--color-outline)' : '#0B2545' }}>
                  {s.checkin}
                </div>
              </div>
            ))}

            <button
              id="staff-view-full-roster-btn"
              style={{
                display: 'block',
                margin: '16px auto 0',
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
              aria-label="View full staff roster"
            >
              View Full Roster
            </button>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Systemic Shortages */}
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: 18 }}>flag</span>
                <h3 className="text-label-sm" style={{ color: 'var(--color-on-surface)', margin: 0 }}>SYSTEMIC SHORTAGES</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SHORTAGES.map((s) => (
                  <div
                    key={s.title}
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span className="font-medium" style={{ fontSize: 14, color: '#0B2545' }}>{s.title}</span>
                    <span
                      style={{
                        borderRadius: 9999,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: s.tagColor,
                        border: `1px solid ${s.tagColor}40`,
                        background: `${s.tagColor}10`,
                      }}
                    >
                      {s.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeployment Actions */}
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 16, margin: 0 }}>Redeployment</h3>
                <span
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 9999,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {REDEPLOYMENTS.length} Actions
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {REDEPLOYMENTS.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderLeft: `3px solid ${i === 0 ? '#ba1a1a' : '#d97706'}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div className="font-semibold" style={{ fontSize: 13, color: '#0B2545', marginBottom: 4 }}>
                      {r.title}
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: i === 0 ? '#ba1a1a' : '#d97706',
                          fontWeight: 700,
                        }}
                      >
                        {r.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 10px' }}>
                      {r.desc}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        id={`staff-redeploy-approve-${i}`}
                        className="btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: 12, borderRadius: 8 }}
                      >
                        {r.btnLabel}
                      </button>
                      <button
                        id={`staff-redeploy-dismiss-${i}`}
                        className="btn-ghost"
                        style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8 }}
                        aria-label="Dismiss redeployment"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
