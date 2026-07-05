import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import SeverityBadge from '../components/ui/SeverityBadge';

const INITIAL_CRITICAL = [
  {
    id: 'c1',
    category: 'Stock',
    subTitle: 'Central Warehouse',
    timeLeft: '24m left',
    title: 'Emergency Transfer: 500 units Paracetamol',
    route: 'From: Central Warehouse → To: North District Clinic',
    blastRadius: 'High impact on North District maternity ward. Current stock depletes in 2 hours.',
    rec: 'Approve',
    confidence: '94%',
    chartData: [20, 15, 10, 30, 45, 60, 75, 90],
    expanded: true,
  }
];

const INITIAL_STANDARD = [
  {
    id: 's1',
    category: 'Staff',
    subTitle: 'East Wing',
    severity: 'medium',
    timeLeft: '14h left',
    title: 'Staff Reallocation: 3 ICU Nurses',
    desc: 'Shift: Night (22:00 - 06:00) • Covering anticipated surge',
    checked: false,
  },
  {
    id: 's2',
    category: 'Referrals',
    subTitle: 'South Clinic',
    severity: 'low',
    timeLeft: '2d left',
    title: 'Outpatient Referral Batch (12 Patients)',
    desc: 'Specialty: Cardiology • Routine screenings',
    checked: true,
  }
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [criticalItems, setCriticalItems] = useState(INITIAL_CRITICAL);
  const [standardItems, setStandardItems] = useState(INITIAL_STANDARD);

  const handleToggleCriticalExpand = (id) => {
    setCriticalItems(prev =>
      prev.map(item => item.id === id ? { ...item, expanded: !item.expanded } : item)
    );
  };

  const handleToggleSelectStandard = (id) => {
    setStandardItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleApproveStandard = (id) => {
    setStandardItems(prev => prev.filter(item => item.id !== id));
  };

  const handleRejectStandard = (id) => {
    setStandardItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApproveCritical = (id) => {
    setCriticalItems(prev => prev.filter(item => item.id !== id));
  };

  const handleRejectCritical = (id) => {
    setCriticalItems(prev => prev.filter(item => item.id !== id));
  };

  const selectedCount = standardItems.filter(item => item.checked).length;

  const filteredStandard = standardItems.filter(item => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
  });

  const filteredCritical = criticalItems.filter(item => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
  });

  return (
    <PageShell>
      <div style={{ paddingBottom: 32 }}>
        {/* Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', lgDirection: 'row', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
          <div>
            <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
              Approvals Inbox
            </h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Review and manage pending operational decisions.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <div className="flex items-center bg-surface-container-low rounded-full p-1 border border-white/50 glass-card-static">
              {['All', 'Stock', 'Staff', 'Referrals'].map((tab) => (
                <button
                  key={tab}
                  id={`approvals-tab-${tab.toLowerCase()}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
                    activeTab === tab
                      ? 'bg-primary/20 text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-white/40'
                  }`}
                  style={{ border: 'none', cursor: 'pointer' }}
                  aria-pressed={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                padding: '8px 16px',
                borderRadius: 9999,
              }}
              className="glass-card-static"
            >
              <input
                id="approvals-select-multiple-checkbox"
                type="checkbox"
                checked={selectMultiple}
                onChange={(e) => setSelectMultiple(e.target.checked)}
                className="form-checkbox text-primary rounded border-outline-variant bg-white/50 focus:ring-primary w-4 h-4"
                aria-label="Select multiple mode"
              />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">Select Multiple</span>
            </label>
          </div>
        </div>

        {/* Approvals Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Critical Group */}
          {filteredCritical.length > 0 && (
            <div>
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> Requires Immediate Action
              </h3>

              {filteredCritical.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-0 overflow-hidden border border-error/20 mb-4 transition-all duration-300"
                  style={{ boxShadow: '0 4px 20px rgba(186,26,26,0.08)' }}
                  role="article"
                  aria-label={`Immediate Approval: ${item.title}`}
                >
                  {/* Summary Row */}
                  <div
                    className="p-5 flex flex-col xl:flex-row xl:items-center gap-5 bg-white/30 cursor-pointer"
                    onClick={() => handleToggleCriticalExpand(item.id)}
                  >
                    <div className="flex items-start gap-4 min-w-[280px]">
                      <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container shrink-0 border border-white/40">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.category === 'Stock' ? 'inventory_2' : 'groups'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">{item.subTitle}</span>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/20 font-label-sm text-[10px] uppercase font-bold tracking-wider">
                            Critical
                          </span>
                          <span className="text-error font-label-sm text-label-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">timer</span> {item.timeLeft}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h4 className="font-body-md text-body-md text-on-surface font-semibold mb-1">{item.title}</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{item.route}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-4 xl:mt-0" onClick={(e) => e.stopPropagation()}>
                      <button id={`critical-modify-${item.id}`} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}>Modify</button>
                      <button id={`critical-reject-${item.id}`} className="px-4 py-2 rounded-lg border border-error/40 text-error hover:bg-error-container/50 font-label-sm text-label-sm transition-colors bg-white/40" onClick={() => handleRejectCritical(item.id)}>Reject</button>
                      <button id={`critical-approve-${item.id}`} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-secondary/90 transition-colors shadow-sm" onClick={() => handleApproveCritical(item.id)}>Approve</button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {item.expanded && (
                    <div className="p-6 border-t border-white/40 bg-surface-dim/20 backdrop-blur-md">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Context Column */}
                        <div className="lg:col-span-1 flex flex-col gap-4">
                          <div className="glass-panel p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-error">warning</span>
                              <span className="font-label-sm text-label-sm font-bold text-on-surface">Blast Radius</span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                              {item.sidebarDesc || item.blastRadius}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary-container/20 border border-secondary-container/30">
                            <span className="material-symbols-outlined text-secondary">verified</span>
                            <span className="font-label-sm text-label-sm text-on-surface font-medium">
                              System Recommendation: <span className="text-secondary">{item.rec}</span>
                            </span>
                          </div>
                        </div>

                        {/* Forecast Chart Column */}
                        <div className="lg:col-span-2 glass-panel p-4 rounded-lg relative overflow-hidden">
                          <div className="flex justify-between items-center mb-4 relative z-10">
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                              21-Day Inventory Forecast (North District)
                            </span>
                            <span className="px-2 py-1 bg-surface-container rounded text-xs font-semibold text-tertiary border border-white/50 shadow-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">auto_graph</span> {item.confidence} Confidence
                            </span>
                          </div>

                          <div className="h-32 w-full relative z-10 flex items-end justify-between gap-1 px-2 pb-2 border-b border-l border-outline-variant/30">
                            {item.chartData.map((h, i) => (
                              <div
                                key={i}
                                style={{
                                  height: `${h}%`,
                                  background: h < 30 ? 'rgba(186,26,26,0.6)' : 'var(--color-primary)',
                                  flex: 1,
                                  borderRadius: '2px 2px 0 0',
                                }}
                              />
                            ))}
                            {/* SVG Trend Line Overlay */}
                            <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                              <path
                                className="text-secondary drop-shadow-md"
                                d="M0,80 L12,85 L25,90 L37,70 L50,55 L62,40 L75,25 L87,10 L100,5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle className="fill-error" cx="25" cy="90" r="3" />
                            </svg>
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-outline px-2 relative z-10">
                            <span>Today</span>
                            <span>+7d</span>
                            <span>+14d</span>
                            <span>+21d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Standard Queue */}
          <div>
            <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-outline"></span> Standard Queue
            </h3>

            {filteredStandard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }} className="glass-panel">
                <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4 }}>fact_check</span>
                <p className="font-semibold mt-2">No pending standard approvals</p>
              </div>
            ) : (
              filteredStandard.map((item) => (
                <div
                  key={item.id}
                  className={`glass-card rounded-xl p-5 flex flex-col xl:flex-row xl:items-center gap-5 hover:bg-white/60 transition-colors border-l-4 border-l-${
                    item.severity === 'medium' ? 'tertiary-container' : 'surface-variant'
                  } mb-3`}
                  role="article"
                  aria-label={`Standard Approval: ${item.title}`}
                >
                  <div className="flex items-start gap-4 min-w-[280px]">
                    {/* Checkbox for Select Multiple */}
                    {selectMultiple && (
                      <div className="mt-1 mr-2">
                        <input
                          id={`standard-checkbox-${item.id}`}
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleSelectStandard(item.id)}
                          className="form-checkbox text-primary rounded border-outline-variant bg-white focus:ring-primary w-5 h-5 cursor-pointer shadow-sm"
                          aria-label={`Select ${item.title}`}
                        />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0 border border-white/40">
                      <span className="material-symbols-outlined">
                        {item.category === 'Staff' ? 'groups' : item.category === 'Referrals' ? 'hail' : 'inventory_2'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">{item.subTitle}</span>
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge level={item.severity} />
                        <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 opacity-70">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> {item.timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h4 className="font-body-md text-body-md text-on-surface font-medium mb-1">{item.title}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-4 xl:mt-0">
                    <button id={`standard-modify-${item.id}`} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}>Modify</button>
                    <button id={`standard-reject-${item.id}`} className="px-4 py-2 rounded-lg border border-error/30 text-error hover:bg-error-container/50 font-label-sm text-label-sm transition-colors bg-white/40" onClick={() => handleRejectStandard(item.id)}>Reject</button>
                    <button id={`standard-approve-${item.id}`} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-secondary/90 transition-colors shadow-sm" onClick={() => handleApproveStandard(item.id)}>Approve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectMultiple && selectedCount > 0 && (
          <div className="fixed bottom-6 left-0 md:left-64 right-0 px-4 md:px-16 z-40 flex justify-center pointer-events-none">
            <div className="glass-modal rounded-full px-6 py-4 flex items-center gap-6 pointer-events-auto shadow-2xl">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {selectedCount}
                </div>
                <span className="font-body-md text-body-md text-on-surface font-medium">Selected</span>
              </div>
              <div style={{ height: 32, width: 1, background: 'var(--color-outline-variant)' }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  id="bulk-cancel-btn"
                  className="btn-ghost"
                  style={{ borderRadius: 9999, padding: '8px 18px', fontSize: 13 }}
                  onClick={() => setSelectMultiple(false)}
                >
                  Cancel
                </button>
                <button
                  id="bulk-reject-btn"
                  className="btn-ghost"
                  style={{
                    borderRadius: 9999,
                    padding: '8px 18px',
                    fontSize: 13,
                    color: '#ba1a1a',
                    borderColor: 'rgba(186,26,26,0.3)',
                    background: 'rgba(186,26,26,0.06)',
                  }}
                  onClick={() => {
                    setStandardItems(prev => prev.filter(item => !item.checked));
                    setSelectMultiple(false);
                  }}
                >
                  Reject All
                </button>
                <button
                  id="bulk-approve-btn"
                  className="btn-primary"
                  style={{ borderRadius: 9999, padding: '8px 20px', fontSize: 13 }}
                  onClick={() => {
                    setStandardItems(prev => prev.filter(item => !item.checked));
                    setSelectMultiple(false);
                  }}
                >
                  Approve Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
