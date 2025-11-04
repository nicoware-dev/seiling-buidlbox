'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ServiceSelectorProps {
  services: Array<{ id: string; name: string; containerName: string }>;
  currentServiceId: string;
}

export default function ServiceSelector({ services, currentServiceId }: ServiceSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState(() => {
    return searchParams.get('service') || currentServiceId;
  });

  // Update LogsViewer when selection changes
  useEffect(() => {
    const serviceId = searchParams.get('service') || currentServiceId;
    setSelectedService(serviceId);
    
    // Update URL without navigation
    if (serviceId && serviceId !== currentServiceId) {
      const params = new URLSearchParams();
      params.set('service', serviceId);
      router.replace(`/logs?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, currentServiceId, router]);

  const handleChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const params = new URLSearchParams();
    if (serviceId) {
      params.set('service', serviceId);
    }
    router.push(`/logs?${params.toString()}`);
    
    // Trigger re-render of LogsViewer by updating window
    window.dispatchEvent(new Event('service-changed'));
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      Service:
      <select
        onChange={(e) => handleChange(e.target.value)}
        value={selectedService}
        style={{
          padding: '6px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      >
        {services.map(service => (
          <option key={service.id} value={service.id}>
            {service.name} ({service.containerName})
          </option>
        ))}
      </select>
    </label>
  );
}

