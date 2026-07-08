import { useState } from 'react';
import PageShell from '../components/layout/PageShell';

const INITIAL_STOCK = [
  { id: 'p1', sku: 'Paracetamol 500mg', labelHindi: 'पैरासिटामोल 500mg', count: 142, transcribing: false },
  { id: 'a1', sku: 'Amoxicillin 250mg', labelHindi: 'अमोक्सिसिलिन 250mg', count: 85, transcribing: false },
];

const INITIAL_STAFF = [
  { id: 's1', name: 'Rahul Sharma', role: 'Pharmacist', present: true, initials: 'RA' },
  { id: 's2', name: 'Dr. Arjun Jha', role: 'Medical Officer', present: true, initials: 'AJ' },
  { id: 's3', name: 'Priya Thomas', role: 'Staff Nurse', present: false, initials: 'PT' },
];

export default function FacilityDataEntryPage() {
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [patientCount, setPatientCount] = useState(218);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [syncStatus, setSyncStatus] = useState('All entries synced (32m ago)');
  const [syncing, setSyncing] = useState(false);
  const [voiceText, setVoiceText] = useState('"Add fifteen strips..."');

  const handleAdjustCount = (id, amount) => {
    setStock(prev =>
      prev.map(item => item.id === id ? { ...item, count: Math.max(0, item.count + amount) } : item)
    );
  };

  const handleManualCountChange = (id, value) => {
    const val = parseInt(value, 10);
    setStock(prev =>
      prev.map(item => item.id === id ? { ...item, count: isNaN(val) ? 0 : val } : item)
    );
  };

  const handleToggleStaff = (id) => {
    setStaff(prev =>
      prev.map(s => s.id === id ? { ...s, present: !s.present } : s)
    );
  };

  const handleTriggerVoice = async (id) => {
    // Simulate speech-to-text input
    setStock(prev =>
      prev.map(item => item.id === id ? { ...item, transcribing: true } : item)
    );
    setVoiceText('Listening...');
    await new Promise(r => setTimeout(r, 1500));
    setVoiceText('"Add twelve units..."');
    setStock(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, count: item.count + 12, transcribing: false };
        }
        return item;
      })
    );
    setSyncStatus('Draft updated. Unsaved changes.');
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncStatus('Syncing entries to command center...');
    await new Promise(r => setTimeout(r, 1200));
    setSyncing(false);
    setSyncStatus('All entries synced (just now)');
  };

  return (
    <PageShell>
      <div style={{ paddingBottom: 32 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 className="text-headline-lg" style={{ color: '#0B2545', marginBottom: 4, marginTop: 0 }}>
            Facility Data Entry
          </h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            Record local facility metrics, daily counts, and staff check-ins.
          </p>
        </div>

        {/* Centered glass sheet */}
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sync Status Banner */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className="glass-panel inline-flex items-center gap-3 px-5 py-2.5"
              style={{ borderRadius: 9999, fontSize: 13, color: 'var(--color-on-surface-variant)' }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: syncStatus.includes('synced') ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: syncStatus.includes('synced') ? '#059669' : '#d97706',
                    fontSize: 16,
                  }}
                >
                  {syncStatus.includes('synced') ? 'check_circle' : 'pending'}
                </span>
              </div>
              <span>{syncStatus}</span>
              <div style={{ width: 1, height: 16, background: 'var(--color-outline-variant)' }} />
              <button
                id="facility-sync-btn"
                onClick={handleTriggerSync}
                disabled={syncing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: syncing ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Sync data now"
              >
                <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`} style={{ fontSize: 18 }}>
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="glass-panel p-6 lg:p-8 flex flex-col gap-8">
            {/* 1. Stock Entry */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: '0 0 2px' }}>Stock Entry</h3>
                <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>स्टॉक प्रविष्टि</span>
              </div>

              {/* SKU List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stock.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/20"
                  >
                    <div>
                      <div className="font-semibold" style={{ color: '#0B2545', fontSize: 16 }}>{item.sku}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{item.labelHindi}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Count Stepper */}
                      <div
                        className="flex items-center bg-surface-container/60 rounded-lg p-1 border border-white/30"
                        style={{ height: 44 }}
                      >
                        <button
                          id={`stepper-dec-${item.id}`}
                          onClick={() => handleAdjustCount(item.id, -1)}
                          style={{
                            width: 36,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          aria-label={`Decrease count for ${item.sku}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
                        </button>
                        <input
                          id={`stepper-input-${item.id}`}
                          type="text"
                          value={item.count}
                          onChange={(e) => handleManualCountChange(item.id, e.target.value)}
                          style={{
                            width: 56,
                            textAlign: 'center',
                            background: 'transparent',
                            border: 'none',
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#0B2545',
                            outline: 'none',
                          }}
                          aria-label={`Count for ${item.sku}`}
                        />
                        <button
                          id={`stepper-inc-${item.id}`}
                          onClick={() => handleAdjustCount(item.id, 1)}
                          style={{
                            width: 36,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          aria-label={`Increase count for ${item.sku}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                        </button>
                      </div>

                      {/* Voice mic */}
                      <button
                        id={`voice-mic-${item.id}`}
                        onClick={() => handleTriggerVoice(item.id)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                          item.transcribing
                            ? 'bg-primary-container text-on-primary-container border-primary animate-pulse'
                            : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant border-white/30'
                        }`}
                        style={{ cursor: 'pointer' }}
                        aria-label={`Voice input for ${item.sku}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mic</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voice transcription notification preview */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-tertiary animate-pulse">graphic_eq</span>
                <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>
                  {voiceText}
                </span>
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--color-outline-variant)', opacity: 0.3 }} />

            {/* 2. Daily Patient Count */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: '0 0 2px' }}>Daily Patient Count</h3>
                <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>दैनिक रोगी गणना</span>
              </div>

              <div
                className="glass-input p-6 border border-white/40"
                style={{ borderRadius: 16, display: 'flex', justifyContent: 'center' }}
              >
                <input
                  id="facility-patient-count"
                  type="number"
                  value={patientCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setPatientCount(isNaN(v) ? 0 : v);
                    setSyncStatus('Draft updated. Unsaved changes.');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: 56,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    outline: 'none',
                    width: '100%',
                    maxWidth: 240,
                  }}
                  placeholder="0"
                  aria-label="Daily patient count"
                />
              </div>
            </section>

            <div style={{ height: 1, background: 'var(--color-outline-variant)', opacity: 0.3 }} />

            {/* 3. Attendance Roster */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 className="font-semibold" style={{ color: '#0B2545', fontSize: 18, margin: '0 0 2px' }}>Staff Attendance</h3>
                <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>कर्मचारी उपस्थिति</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white/20 rounded-xl border border-white/30"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'rgba(0,100,148,0.1)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {s.initials}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: '#0B2545', fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{s.role}</div>
                      </div>
                    </div>

                    <button
                      id={`staff-toggle-present-${s.id}`}
                      className={s.present ? 'btn-primary' : 'btn-ghost'}
                      style={{
                        padding: '6px 16px',
                        fontSize: 13,
                        borderRadius: 8,
                        background: s.present ? '#059669' : 'transparent',
                        borderColor: s.present ? 'transparent' : 'rgba(0,100,148,0.2)',
                        color: s.present ? '#fff' : 'var(--color-primary)',
                      }}
                      onClick={() => {
                        handleToggleStaff(s.id);
                        setSyncStatus('Draft updated. Unsaved changes.');
                      }}
                      aria-label={`Toggle presence for ${s.name}`}
                    >
                      {s.present ? '✓ Present' : 'Mark Present'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
