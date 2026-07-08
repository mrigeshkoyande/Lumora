import { useState, useEffect, useCallback } from 'react';
import { analyze } from '../api/client';

/**
 * useAnalysis — Fetch AI health risk analysis for a given location.
 * Connects to POST /analyze.
 *
 * @param {string} location   Default location to analyze
 * @param {string} timeFrame  Time frame for the analysis
 */
export function useAnalysis(location = 'Chennai, India', timeFrame = 'Current and Next 7 Days') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const run = useCallback(async (loc = location, tf = timeFrame) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyze(loc, tf);
      setData(result);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [location, timeFrame]);

  // Auto-run on mount
  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, lastFetched, refetch: run };
}

/**
 * useSnapshot — Fetch raw weather + news snapshot without AI.
 * Connects to GET /snapshot?location=...
 */
export function useSnapshot(location = 'Chennai, India') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    import('../api/client').then(({ snapshot }) => snapshot(location))
      .then((result) => { setData(result); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [location]);

  return { data, loading, error };
}
