import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — Arogya OS sign-in screen.
 * Faithfully replicates the "login_desktop_light_with_pin_option" design.
 * Mock auth: any credentials accepted, navigates to /dashboard.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setLoading(true);
    setError('');
    // Mock delay
    await new Promise((r) => setTimeout(r, 800));
    login(email);
    navigate('/onboarding');
  };

  const handlePinSignIn = async (e) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length < 4) {
      setError('Please enter all 4 PIN digits.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    login('admin@arogya.gov.in');
    navigate('/onboarding');
  };

  const handlePinInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[idx] = val;
    setPin(next);
    // Auto-advance focus
    if (val && idx < 3) {
      document.getElementById(`pin-input-${idx + 1}`)?.focus();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient background */}
      <div className="bg-liquid" aria-hidden="true" />
      <div aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Card */}
      <div
        className="glass-card-static"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 48px',
          margin: '16px',
          borderRadius: 24,
          position: 'relative',
          zIndex: 1,
        }}
        role="main"
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,100,148,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--color-primary)', fontSize: 20 }}>
                  medical_services
                </span>
              </div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Arogya OS
              </h1>
            </div>

            {/* Language selector */}
            <button
              id="login-language-btn"
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}
              aria-label="Select language"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>language</span>
              EN
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
            </button>
          </div>

          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            Sign in to access your administrative workspace.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(186,26,26,0.08)',
              border: '1px solid rgba(186,26,26,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 20,
              color: '#ba1a1a',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            role="alert"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
            {error}
          </div>
        )}

        {/* Sign-in Form */}
        {!showPin ? (
          <form onSubmit={handleSignIn} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="login-email"
                className="text-label-sm"
                style={{ color: '#0B2545', display: 'block', marginBottom: 8 }}
              >
                Email Address
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
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="practitioner@arogya.gov.in"
                  className="glass-input"
                  style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 14 }}
                  autoComplete="email"
                  required
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="login-password"
                className="text-label-sm"
                style={{ color: '#0B2545', display: 'block', marginBottom: 8 }}
              >
                Password
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
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input"
                  style={{ paddingLeft: 44, paddingRight: 48, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 14 }}
                  autoComplete="current-password"
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  id="login-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--color-outline)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <button
                id="login-forgot-password-btn"
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 14, fontWeight: 500 }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
              aria-label="Sign in"
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} />
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
              <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
            </div>

            {/* PIN sign in */}
            <button
              id="login-pin-btn"
              type="button"
              className="btn-ghost"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
              }}
              onClick={() => { setShowPin(true); setError(''); }}
            >
              Sign in with PIN
            </button>
          </form>
        ) : (
          /* PIN Form */
          <form onSubmit={handlePinSignIn}>
            <p className="text-body-md mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>
              Enter your 4-digit access PIN.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  id={`pin-input-${i}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinInput(e.target.value, i)}
                  className="glass-input"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    padding: 0,
                  }}
                  aria-label={`PIN digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              id="login-pin-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 600 }}
            >
              {loading ? <div className="spinner" style={{ margin: '0 auto', width: 20, height: 20, borderWidth: 2.5 }} /> : 'Verify PIN'}
            </button>

            <button
              id="login-back-to-password-btn"
              type="button"
              className="btn-ghost"
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, marginTop: 12 }}
              onClick={() => { setShowPin(false); setPin(['', '', '', '']); setError(''); }}
            >
              ← Back to Password
            </button>
          </form>
        )}

        {/* Footer */}
        <p
          className="text-label-sm"
          style={{ textAlign: 'center', color: 'var(--color-outline)', marginTop: 32 }}
        >
          Ministry of Health &amp; Family Welfare
        </p>
      </div>
    </div>
  );
}
