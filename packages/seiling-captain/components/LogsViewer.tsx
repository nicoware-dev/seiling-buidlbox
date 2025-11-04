'use client';

import { useState, useEffect, useRef } from 'react';

interface LogsViewerProps {
  serviceId: string;
}

export default function LogsViewer({ serviceId }: LogsViewerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState(100);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Get service from URL if available
  const effectiveServiceId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('service') || serviceId
    : serviceId;

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const loadLogs = async (followMode: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      if (followMode) {
        // Use SSE for following
        const url = `/api/logs?service=${encodeURIComponent(effectiveServiceId)}&lines=${lines}&follow=true`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const logLine = event.data;
          setLogs(prev => [...prev, logLine]);
        };

        eventSource.onerror = () => {
          eventSource.close();
          setFollowing(false);
          setError('Connection closed');
        };

        setFollowing(true);
        setLoading(false);
      } else {
        // Regular fetch
        const response = await fetch(`/api/logs?service=${encodeURIComponent(effectiveServiceId)}&lines=${lines}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load logs');
        }

        setLogs(data.logs || []);
        setLoading(false);
        setFollowing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      setLoading(false);
      setFollowing(false);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Listen for service changes
    const handleServiceChange = () => {
      if (!following) {
        loadLogs();
      }
    };
    window.addEventListener('service-changed', handleServiceChange);
    
    return () => {
      // Cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      window.removeEventListener('service-changed', handleServiceChange);
    };
  }, [effectiveServiceId, lines, following]);

  const handleToggleFollow = () => {
    if (following) {
      // Stop following
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setFollowing(false);
    } else {
      // Start following
      loadLogs(true);
    }
  };

  const handleCopy = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = logs.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serviceId}-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="toolbar">
        <span style={{ fontWeight: 700, marginRight: 16 }}>Logs: {effectiveServiceId}</span>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Lines:
          <input
            type="number"
            value={lines}
            onChange={(e) => setLines(parseInt(e.target.value, 10) || 100)}
            disabled={following}
            className="input"
            style={{ width: 80 }}
          />
        </label>

        <button onClick={handleToggleFollow} className={following ? 'btn btn-danger' : 'btn btn-success'}>
          {following ? 'Stop Following' : 'Follow Logs'}
        </button>

        <button onClick={() => loadLogs(following)} disabled={loading} className="btn btn-secondary">
          Refresh
        </button>

        <button onClick={handleCopy} className="btn btn-secondary">
          Copy
        </button>

        <button onClick={handleDownload} className="btn btn-secondary">
          Download
        </button>
      </div>

      {error && (
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div className="terminal" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading && logs.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>No logs available</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: 2 }}>
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

