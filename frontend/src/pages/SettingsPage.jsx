import { useState } from 'react';
import PageShell from '../components/layout/PageShell';

const SECTIONS = [
  { id: 'users',     icon: 'manage_accounts', label: 'Users & Roles' },
  { id: 'guardrail', icon: 'security',        label: 'Guardrail Thresholds' },
  { id: 'language',  icon: 'translate',       label: 'Language & Localization' },
  { id: 'hierarchy', icon: 'account_tree',    label: 'Facility Hierarchy' },
];

const MOCK_USERS = [
  { initials: 'SD', color: '#3ab5ff', name: 'Dr. S. Desai', email: 's.desai@arogya.gov.in', role: 'Medical Officer', scope: 'Pune Central Hospital', status: 'active' },
  { initials: 'AK', color: '#64d7df', name: 'A. Kapoor',    email: 'a.kapoor@arogya.gov.in', role: 'District Admin',   scope: 'Pune District Wide',    status: 'active' },
  { initials: 'MT', color: '#8ecdff', name: 'M. Thomas',    email: 'm.thomas@arogya.gov.in', role: 'Health Officer',  scope: 'East Zone',             status: 'active' },
];

const GUARDRAILS = [
  { label: 'Stock-out Alert Threshold',   value: '< 7 days',  unit: 'days' },
  { label: 'Bed Occupancy Warning',       value: '> 80%',     unit: '%' },
  { label: 'Report Overdue Flag',         value: '48 hours',  unit: 'hrs' },
  { label: 'AI Confidence Minimum',       value: '70%',       unit: '%' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('users');
  const [searchUser, setSearchUser] = useState('');

  return (
    <PageShell>
      <div style={{ paddingBottom: 32 }}>
        <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>Admin Configuration</h2>
        <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: '0 0 24px' }}>
          Manage system access, rulesets, and organizational structures.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Section nav */}
          <div className="glass-panel lg:col-span-3" style={{ padding: 12 }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                id={`settings-section-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
                style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none' }}
                aria-label={s.label}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="glass-panel lg:col-span-9" style={{ padding: 28 }}>
            {/* Users & Roles */}
            {activeSection === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, margin: 0 }}>Users &amp; Roles</h3>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--color-outline)' }}
                      >
                        search
                      </span>
                      <input
                        id="settings-user-search"
                        type="text"
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="glass-input"
                        style={{ borderRadius: 10, paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14 }}
                        aria-label="Search users"
                      />
                    </div>
                    <button
                      id="settings-add-user-btn"
                      className="btn-primary"
                      style={{ display: 'flex', gap: 6, alignItems: 'center', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}
                      aria-label="Add new user"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      Add User
                    </button>
                  </div>
                </div>

                {/* Users table */}
                <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <div style={{ minWidth: 600 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 0.8fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.2)' }}>
                    {['User', 'Role', 'Scope', 'Status', 'Actions'].map((h) => (
                      <span key={h} className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{h}</span>
                    ))}
                  </div>
                  {MOCK_USERS.filter(u => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase())).map((u) => (
                    <div
                      key={u.email}
                      role="row"
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 0.8fr 1fr', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.3)', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0B2545', flexShrink: 0 }}>
                          {u.initials}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ fontSize: 14, color: '#0B2545' }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div>
                        <span style={{ background: 'rgba(0,100,148,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(0,100,148,0.2)', borderRadius: 9999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>{u.scope}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
                        <span style={{ fontSize: 13, color: '#059669', fontWeight: 500 }}>Active</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button id={`settings-edit-user-${u.initials.toLowerCase()}`} className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Edit</button>
                        <button id={`settings-revoke-user-${u.initials.toLowerCase()}`} className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12, color: '#ba1a1a', borderColor: 'rgba(186,26,26,0.3)' }}>Revoke</button>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guardrails */}
            {activeSection === 'guardrail' && (
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, marginBottom: 24, marginTop: 0 }}>Guardrail Thresholds</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {GUARDRAILS.map((g) => (
                    <div key={g.label} className="glass-row" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="font-medium" style={{ fontSize: 15, color: '#0B2545' }}>{g.label}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className="tabular-nums font-bold" style={{ fontSize: 16, color: 'var(--color-primary)' }}>{g.value}</span>
                        <button
                          id={`guardrail-edit-${g.label.toLowerCase().replace(/\s+/g, '-')}`}
                          className="btn-ghost"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          aria-label={`Edit ${g.label}`}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            {activeSection === 'language' && (
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, marginBottom: 24, marginTop: 0 }}>Language &amp; Localization</h3>
                {['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'मराठी'].map((lang) => (
                  <div key={lang} className="glass-row" style={{ padding: '14px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-medium" style={{ fontSize: 15, color: '#0B2545' }}>{lang}</span>
                    {lang === 'English' ? (
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 13 }}>Active</span>
                    ) : (
                      <button
                        id={`lang-select-${lang.toLowerCase()}`}
                        className="btn-ghost"
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        aria-label={`Set language to ${lang}`}
                      >
                        Select
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Facility Hierarchy */}
            {activeSection === 'hierarchy' && (
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 20, marginBottom: 24, marginTop: 0 }}>Facility Hierarchy</h3>
                {[
                  { level: 'District', count: 1, icon: 'account_balance' },
                  { level: 'Sub-District / CHC', count: 8, icon: 'local_hospital' },
                  { level: 'PHC / Health Centre', count: 32, icon: 'health_and_safety' },
                  { level: 'Sub-Health Centre', count: 148, icon: 'medical_services' },
                ].map((h) => (
                  <div key={h.level} className="glass-row" style={{ padding: '14px 20px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 22 }}>{h.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-semibold" style={{ color: '#0B2545', fontSize: 14 }}>{h.level}</div>
                    </div>
                    <div className="tabular-nums font-bold" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)' }}>{h.count}</div>
                  </div>
                ))}
                <button
                  id="settings-add-facility-btn"
                  className="btn-primary"
                  style={{ marginTop: 16, padding: '10px 20px', fontSize: 14, borderRadius: 10 }}
                  aria-label="Add new facility to hierarchy"
                >
                  + Add Facility
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
