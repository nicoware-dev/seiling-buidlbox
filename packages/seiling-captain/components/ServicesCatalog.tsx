'use client';

import { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import type { ServiceMetadata } from '../lib/serviceCatalog';
import type { ServiceStatus } from '../lib/docker';

interface ServicesCatalogProps {
  initialServices: Array<ServiceMetadata & { status?: ServiceStatus }>;
}

export default function ServicesCatalog({ initialServices }: ServicesCatalogProps) {
  const [services, setServices] = useState(initialServices);
  const [isPolling, setIsPolling] = useState(true);

  // Poll for service status updates
  useEffect(() => {
    if (!isPolling) return;

    const pollServices = async () => {
      try {
        const response = await fetch('/api/services', {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.services) {
            setServices(data.services);
          }
        }
      } catch (error) {
        console.error('Error polling services:', error);
      }
    };

    // Poll immediately, then every 5 seconds
    pollServices();
    const interval = setInterval(pollServices, 5000);

    return () => clearInterval(interval);
  }, [isPolling]);

  const runningCount = services.filter(s => s.status === 'running').length;

  return (
    <div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="muted">{runningCount} of {services.length} services running</span>
          {isPolling && (
            <span className="badge badge-green">Live Updates</span>
          )}
        </div>
        <button onClick={() => setIsPolling(!isPolling)} className={isPolling ? 'btn btn-danger' : 'btn btn-success'} style={{ fontSize: 12 }}>
          {isPolling ? '⏸ Stop Auto-Refresh' : '▶ Start Auto-Refresh'}
        </button>
      </div>

      <div className="grid cards">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

