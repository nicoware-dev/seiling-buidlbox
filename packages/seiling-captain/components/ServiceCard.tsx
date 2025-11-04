'use client';

import { useState, useEffect } from 'react';
import HealthStatus from './HealthStatus';
import type { ServiceMetadata } from '../lib/serviceCatalog';
import type { ServiceStatus } from '../lib/docker';
import type { HealthStatus as HealthStatusType } from '../lib/health';

interface ServiceCardProps {
  service: ServiceMetadata & { status?: ServiceStatus; health?: HealthStatusType };
  onAction?: (action: 'up' | 'down' | 'restart', serviceId: string) => Promise<void>; // Optional for backwards compatibility
}

export default function ServiceCard({ service, onAction }: ServiceCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatusType | null>(service.health || null);
  const status = service.status || 'unknown';

  // Fetch health status periodically when service is running
  useEffect(() => {
    if (status !== 'running') {
      setHealth(null);
      return;
    }

    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          if (data.services && data.services[service.id]) {
            setHealth(data.services[service.id].status);
          }
        }
      } catch (err) {
        // Silently fail - health is optional
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [service.id, status]);

  const handleAction = async (action: 'up' | 'down' | 'restart') => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, service: service.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      // Call onAction if provided (for testing/alternative implementations)
      if (onAction) {
        await onAction(action, service.id);
      }

      // Refresh after action
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'badge badge-green';
      case 'starting':
        return 'badge badge-yellow';
      case 'stopped':
        return 'badge badge-gray';
      default:
        return 'badge badge-gray';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'starting':
        return 'Starting';
      case 'stopped':
        return 'Stopped';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 4 }}>
            {service.name}
          </h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>{service.containerName}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span className={getStatusColor()}>{getStatusText()}</span>
          {health && status === 'running' && (
            <HealthStatus status={health} size="sm" />
          )}
        </div>
      </div>

      {service.ports && service.ports.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p className="muted" style={{ fontSize: 12, marginBottom: 4, margin: 0 }}>Ports:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {service.ports.map((port, idx) => (
              <span key={idx} className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                {port.host}:{port.container}
              </span>
            ))}
          </div>
        </div>
      )}

      {service.dependsOn && service.dependsOn.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>
            Depends on: {service.dependsOn.join(', ')}
          </p>
        </div>
      )}

      {error && (
        <div className="badge badge-red" style={{ display: 'block' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {status === 'stopped' || status === 'unknown' ? (
          <button
            onClick={() => handleAction('up')}
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? 'Starting...' : 'Start'}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleAction('restart')}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Restarting...' : 'Restart'}
            </button>
            <button
              onClick={() => handleAction('down')}
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Stopping...' : 'Stop'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

