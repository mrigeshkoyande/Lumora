/**
 * Arogya OS API Service Layer
 * Backend: FastAPI at http://127.0.0.1:8000
 * Uses Vite proxy (/api → backend) to avoid CORS issues in dev
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Core fetch helper ────────────────────────────────────
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || `Request failed: ${resp.status}`);
  }
  return resp.json();
}

// ─── Endpoints ───────────────────────────────────────────

/** GET /health — Backend heartbeat */
export async function healthCheck() {
  return request('/health');
}

/** GET /geocode?location=... — Resolve text location → coordinates */
export async function geocode(location) {
  return request(`/geocode?location=${encodeURIComponent(location)}`);
}

/**
 * POST /analyze — Full AI multi-agent health risk analysis
 * @param {string} location  e.g. "Chennai, India"
 * @param {string} timeFrame e.g. "Next 7 Days"
 * @returns {Promise<AnalyzeResponse>}
 */
export async function analyze(location, timeFrame = 'Current and Next 7 Days') {
  return request('/analyze', {
    method: 'POST',
    body: JSON.stringify({ location, time_frame: timeFrame }),
  });
}

/**
 * POST /analyze/stream — Streaming ndjson health risk analysis
 * Returns a raw Response for the caller to read as a stream.
 * @returns {Promise<Response>}
 */
export async function analyzeStream(location, timeFrame = 'Current and Next 7 Days') {
  const url = `${BASE_URL}/analyze/stream`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, time_frame: timeFrame }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || `Stream request failed: ${resp.status}`);
  }
  return resp; // Caller reads .body as ReadableStream
}

/** GET /snapshot?location=... — Raw weather + news snapshot (no AI) */
export async function snapshot(location) {
  return request(`/snapshot?location=${encodeURIComponent(location)}`);
}

/** GET /hospitals/coverage — Fetch Chennai hospital coverage data */
export async function getHospitalCoverage() {
  return request('/hospitals/coverage');
}

/**
 * POST /webhook/alert — Run AI analysis AND dispatch Twilio SMS alert
 * @param {string} location
 * @param {string} timeFrame
 */
export async function webhookAlert(location, timeFrame = 'Current and Next 7 Days') {
  return request('/webhook/alert', {
    method: 'POST',
    body: JSON.stringify({ location, time_frame: timeFrame }),
  });
}

// ─── Default export ──────────────────────────────────────
export const api = {
  healthCheck,
  geocode,
  analyze,
  analyzeStream,
  snapshot,
  getHospitalCoverage,
  webhookAlert,
};

export default api;
