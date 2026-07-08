import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamAnalysis } from '../hooks/useStreamAnalysis';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Chennai, India');
  const [timeFrame, setTimeFrame] = useState('Current and Next 7 Days');
  
  const { status, progress, result, error, run } = useStreamAnalysis();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    run(location.trim(), timeFrame);
  };

  // Redirect when analysis finishes successfully
  useEffect(() => {
    if (status === 'done' && result) {
      sessionStorage.setItem('onboarding_location', location);
      sessionStorage.setItem('onboarding_timeframe', timeFrame);
      sessionStorage.setItem('onboarding_report', JSON.stringify(result));
      navigate('/dashboard');
    }
  }, [status, result, navigate, location, timeFrame]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)', padding: 16 }}>
      <div
        className="glass-card-static"
        style={{
          width: '100%',
          maxWidth: 500,
          padding: '40px',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(11, 37, 69, 0.08)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(0,100,148,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--color-primary)', fontSize: 28 }}>
              travel_explore
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--color-navy)',
              margin: '0 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            Configure Health Console
          </h1>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, margin: 0 }}>
            Select the target district and forecast horizon to initialize the surveillance command center.
          </p>
        </div>

        {status === 'streaming' ? (
          /* Loading & Streaming Progress State */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, borderColor: 'var(--color-primary) transparent var(--color-primary) transparent' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-navy)', margin: 0 }}>
              Running Multi-Agent AI Analysis...
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Scanning health records, weather signals, and hospital capacities.
            </p>
            
            {/* Progress Log Box */}
            <div
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid rgba(11, 37, 69, 0.08)',
                borderRadius: 12,
                padding: 16,
                minHeight: 100,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {progress.slice(-3).map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-navy)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-green)' }}>check_circle</span>
                  <span>{msg}</span>
                </div>
              ))}
              {progress.length === 0 && (
                <div style={{ color: 'var(--color-outline)', fontSize: 13, fontStyle: 'italic' }}>
                  Connecting to AI agents...
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Onboarding Form State */
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'rgba(186,26,26,0.06)',
                  border: '1px solid rgba(186,26,26,0.15)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 24,
                  color: 'var(--color-error)',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
                <span style={{ fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Location Input */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="onboard-location"
                className="text-label-sm"
                style={{ color: 'var(--color-navy)', display: 'block', marginBottom: 8, fontWeight: 600 }}
              >
                Target Location / District
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-outline)',
                    fontSize: 20,
                  }}
                >
                  location_on
                </span>
                <input
                  id="onboard-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, India"
                  className="glass-input"
                  style={{
                    paddingLeft: 44,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                  required
                />
              </div>
            </div>

            {/* Time Frame Selection */}
            <div style={{ marginBottom: 32 }}>
              <label
                htmlFor="onboard-timeframe"
                className="text-label-sm"
                style={{ color: 'var(--color-navy)', display: 'block', marginBottom: 8, fontWeight: 600 }}
              >
                Forecast Timeframe
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-outline)',
                    fontSize: 20,
                  }}
                >
                  date_range
                </span>
                <select
                  id="onboard-timeframe"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="glass-input"
                  style={{
                    paddingLeft: 44,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 12,
                    fontSize: 14,
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%236f7882\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    backgroundSize: '20px',
                  }}
                >
                  <option value="Current and Next 7 Days">Current and Next 7 Days</option>
                  <option value="Next 24 hours">Next 24 hours</option>
                  <option value="Next 7 days">Next 7 days</option>
                  <option value="Upcoming Winter">Upcoming Winter</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <button
              id="onboard-submit-btn"
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Initialize Intelligence Console
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
