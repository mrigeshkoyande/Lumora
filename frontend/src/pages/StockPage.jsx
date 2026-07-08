import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import SeverityBadge from '../components/ui/SeverityBadge';
import { LoadingSpinner, ErrorCard, EmptyState } from '../components/ui/StatusComponents';
import { useAnalysis } from '../hooks/useAnalysis';

const DEFAULT_LOCATION = 'Chennai, India';

// ─── Mock Inventory Data (augmented by AI stock-out warnings) ───────────────
const MOCK_INVENTORY = [
  { sku: 'Paracetamol 500mg', category: 'Analgesics', qty: 12450, reorderPt: 5000, daysSupply: 45, tier: 3 },
  { sku: 'Ibuprofen 400mg',   category: 'Analgesics', qty: 8200,  reorderPt: 4000, daysSupply: 22, tier: 2 },
  { sku: 'Metformin 500mg',   category: 'Antidiabetic', qty: 3400, reorderPt: 1500, daysSupply: 30, tier: 2 },
  { sku: 'ORS Sachets',       category: 'Electrolytes', qty: 6000,  reorderPt: 2000, daysSupply: 35, tier: 3 },
];

function DaysSupplyBar({ days, max = 60 }) {
  const pct = Math.min(100, (days / max) * 100);
  const color = days < 7 ? '#ba1a1a' : days < 15 ? '#d97706' : '#059669';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
      <div style={{ flex: 1, maxWidth: 120 }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="tabular-nums font-semibold" style={{ fontSize: 13, color, minWidth: 28 }}>
        {days}d
      </span>
    </div>
  );
}

function TierBadge({ tier }) {
  return (
    <span
      className={`tier-${tier}`}
      style={{
        borderRadius: 9999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
      }}
    >
      Tier {tier}
    </span>
  );
}

export default function StockPage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [activeTab, setActiveTab] = useState('inventory');
  const [expandedSku, setExpandedSku] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const { data, loading, error, refetch } = useAnalysis(location);

  // Merge AI stock-out warnings with mock inventory
  const inventory = useMemo(() => {
    const base = [...MOCK_INVENTORY];
    const aiWarnings = data?.report?.stock_out_warnings || [];
    aiWarnings.forEach((w) => {
      const exists = base.find((b) => b.sku.toLowerCase().includes((w.medicine_name || '').toLowerCase()));
      if (!exists && w.medicine_name) {
        base.push({
          sku: w.medicine_name,
          category: w.category || 'Medicine',
          qty: w.current_stock || 450,
          reorderPt: w.reorder_point || 2000,
          daysSupply: w.days_remaining || 4,
          tier: 1,
          aiWarning: true,
          recommendation: w.recommendation,
        });
      }
    });
    return base;
  }, [data]);

  const transfers = data?.report?.redistribution_recommendations || [];

  const filtered = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (tierFilter !== 'all' && String(item.tier) !== tierFilter) return false;
    return true;
  });

  const categories = [...new Set(inventory.map((i) => i.category))];

  return (
    <PageShell onLocationChange={setLocation} currentLocation={location}>
      <div style={{ paddingBottom: 32 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
            Stock &amp; Supply Chain
          </h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            Manage inventory levels, monitor forecasts, and approve indents.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-outline-variant)', marginBottom: 24 }}>
          {['inventory', 'transfers'].map((tab) => (
            <button
              key={tab}
              id={`stock-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -2,
                padding: '10px 20px',
                cursor: 'pointer',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: 15,
                fontFamily: 'var(--font-family-sans)',
                transition: 'all 0.2s',
              }}
              aria-label={tab === 'inventory' ? 'Inventory tab' : 'Transfers & Indents tab'}
            >
              {tab === 'inventory' ? 'Inventory' : 'Transfers & Indents'}
            </button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <>
            {/* Filters + Export */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              <button
                id="stock-filter-all-categories"
                onClick={() => setCategoryFilter('all')}
                className={categoryFilter === 'all' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9999 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>filter_list</span>
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`stock-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setCategoryFilter(cat === categoryFilter ? 'all' : cat)}
                  className={categoryFilter === cat ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9999 }}
                >
                  {cat}
                </button>
              ))}
              <button
                id="stock-tier-filter"
                onClick={() => setTierFilter(tierFilter === 'all' ? '1' : 'all')}
                className={tierFilter !== 'all' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 16px', fontSize: 13, borderRadius: 9999 }}
              >
                Tier 1 Only
              </button>
              <div style={{ flex: 1 }} />
              <button
                id="stock-export-btn"
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}
                aria-label="Export inventory report"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Export Report
              </button>
            </div>

            {/* Error / Loading */}
            {loading && (
              <div style={{ marginBottom: 16 }}>
                <LoadingSpinner message="Fetching AI stock analysis..." />
              </div>
            )}
            {error && (
              <div style={{ marginBottom: 16 }}>
                <ErrorCard message={error} onRetry={refetch} />
              </div>
            )}

            {/* Inventory Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr',
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.2)',
                }}
                role="rowheader"
              >
                {['SKU Name', 'Quantity', 'Reorder Pt.', 'Days of Supply', 'Tier'].map((h) => (
                  <span key={h} className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <EmptyState icon="medication" title="No items found" description="Adjust your filters to see inventory." />
              ) : (
                filtered.map((item, idx) => (
                  <div key={item.sku}>
                    {/* Row */}
                    <div
                      role="row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.8fr',
                        padding: '18px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.3)',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: expandedSku === item.sku ? 'rgba(0,100,148,0.05)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => setExpandedSku(expandedSku === item.sku ? null : item.sku)}
                      aria-label={`${item.sku} inventory row`}
                    >
                      <div>
                        <div className="font-semibold" style={{ color: '#0B2545', fontSize: 15 }}>
                          {item.sku}
                          {item.aiWarning && (
                            <span
                              className="material-symbols-outlined"
                              style={{ color: '#ba1a1a', fontSize: 16, verticalAlign: 'middle', marginLeft: 6 }}
                              title="AI Warning"
                            >
                              warning
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{item.category}</div>
                      </div>
                      <div
                        className="tabular-nums font-bold"
                        style={{ fontSize: 16, color: item.daysSupply < 7 ? '#ba1a1a' : '#0B2545' }}
                      >
                        {item.qty.toLocaleString()}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 15, color: 'var(--color-on-surface-variant)' }}>
                        {item.reorderPt.toLocaleString()}
                      </div>
                      <DaysSupplyBar days={item.daysSupply} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TierBadge tier={item.tier} />
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 18,
                            color: 'var(--color-outline)',
                            transform: expandedSku === item.sku ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Expanded row */}
                    {expandedSku === item.sku && (
                      <div
                        style={{
                          background: 'rgba(0,100,148,0.03)',
                          borderBottom: '1px solid rgba(255,255,255,0.3)',
                          padding: '20px 24px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 20,
                        }}
                      >
                        {/* Depletion forecast */}
                        <div>
                          <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 12 }}>21-DAY DEPLETION FORECAST</div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                            {[-7, -6, -5, -4, -3, -2, 'Today', 2, 4, 6, 8, 10, 12, 14].map((d, i) => {
                              const isPast = typeof d === 'number' && d < 0;
                              const isToday = d === 'Today';
                              const isCritical = typeof d === 'number' && d > 0 && item.daysSupply - d <= 0;
                              const h = isPast
                                ? Math.max(12, 50 - Math.abs(d) * 3)
                                : isToday ? 45
                                : isCritical ? Math.max(4, 20 - d * 3)
                                : Math.max(8, 45 - d * 3);
                              return (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    height: h,
                                    borderRadius: '2px 2px 0 0',
                                    background: isCritical ? 'rgba(186,26,26,0.6)' : isPast ? 'var(--color-primary)' : 'var(--color-secondary)',
                                    opacity: isPast ? 0.6 : 1,
                                    position: 'relative',
                                  }}
                                >
                                  {isToday && (
                                    <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--color-outline)', whiteSpace: 'nowrap' }}>
                                      Today
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--color-outline)' }}>-7d</span>
                            <span style={{ fontSize: 11, color: 'var(--color-outline)' }}>Today</span>
                            <span style={{ fontSize: 11, color: 'var(--color-outline)' }}>+14d</span>
                          </div>
                          {item.daysSupply < 14 && (
                            <div
                              style={{
                                marginTop: 8,
                                background: 'rgba(186,26,26,0.08)',
                                border: '1px solid rgba(186,26,26,0.2)',
                                borderRadius: 8,
                                padding: '6px 10px',
                                fontSize: 12,
                                color: '#ba1a1a',
                                fontWeight: 600,
                              }}
                            >
                              ⚠ Est. Stockout ({item.daysSupply}d)
                            </div>
                          )}
                        </div>

                        {/* Recommended action */}
                        <div>
                          <div className="text-label-sm" style={{ color: 'var(--color-outline)', marginBottom: 12 }}>RECOMMENDED ACTION</div>
                          <div
                            style={{
                              background: 'rgba(255,255,255,0.5)',
                              border: '1px solid rgba(255,255,255,0.7)',
                              borderRadius: 12,
                              padding: '14px 16px',
                              marginBottom: 14,
                              display: 'flex',
                              gap: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: 20, flexShrink: 0 }}>
                              lightbulb
                            </span>
                            <div>
                              <div className="font-semibold" style={{ fontSize: 14, color: '#0B2545', marginBottom: 4 }}>
                                {item.aiWarning ? 'AI Alert' : 'Therapeutic Substitution Available'}
                              </div>
                              <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                                {item.recommendation ||
                                  'Request emergency transfer or consider substitute medications to extend runway.'}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              id={`stock-emergency-transfer-${idx}`}
                              className="btn-primary"
                              style={{ borderRadius: 10, padding: '10px 16px', fontSize: 13, flex: 1 }}
                            >
                              Request Emergency Transfer
                            </button>
                            <button
                              id={`stock-view-suppliers-${idx}`}
                              className="btn-ghost"
                              style={{ borderRadius: 10, padding: '10px 16px', fontSize: 13, flex: 1 }}
                            >
                              View Suppliers
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Transfers tab */}
        {activeTab === 'transfers' && (
          <div>
            {loading && <LoadingSpinner message="Fetching AI recommendations..." />}
            {!loading && transfers.length === 0 && (
              <EmptyState
                icon="local_shipping"
                title="No active transfers"
                description="AI redistribution recommendations will appear here when stock imbalances are detected."
              />
            )}
            {transfers.map((t, i) => (
              <div
                key={i}
                className="glass-row"
                style={{ padding: '20px 24px', marginBottom: 12, borderLeft: '4px solid var(--color-primary)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="font-semibold" style={{ fontSize: 16, color: '#0B2545', marginBottom: 6 }}>
                      {t.action_type || 'Redistribution Recommendation'}
                    </div>
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {t.description || t.recommendation || JSON.stringify(t)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                    <button
                      id={`transfer-approve-${i}`}
                      className="btn-primary"
                      style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
                    >
                      Approve
                    </button>
                    <button
                      id={`transfer-reject-${i}`}
                      className="btn-ghost"
                      style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
