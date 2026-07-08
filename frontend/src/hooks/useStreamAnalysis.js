import { useState, useCallback } from 'react';
import { analyzeStream } from '../api/client';

/**
 * useStreamAnalysis — Consume the ndjson streaming endpoint.
 * Connects to POST /analyze/stream.
 *
 * Emits:
 *   - progress: string messages
 *   - weatherSnapshot: weather/AQI object
 *   - result: final AI report object
 */
export function useStreamAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | streaming | done | error
  const [progress, setProgress] = useState([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = useCallback(async (location, timeFrame = 'Current and Next 7 Days') => {
    setStatus('streaming');
    setProgress([]);
    setWeatherSnapshot(null);
    setResult(null);
    setError(null);

    try {
      const resp = await analyzeStream(location, timeFrame);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'progress') {
              setProgress((prev) => [...prev, event.data]);
            } else if (event.type === 'weather_snapshot') {
              setWeatherSnapshot(event.data);
            } else if (event.type === 'result') {
              setResult(event.data);
            }
          } catch {
            // Ignore malformed lines
          }
        }
      }

      setStatus('done');
    } catch (err) {
      setError(err.message || 'Stream failed');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress([]);
    setWeatherSnapshot(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, weatherSnapshot, result, error, run, reset };
}
