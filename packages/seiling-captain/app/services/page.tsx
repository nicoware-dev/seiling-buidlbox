import ServicesCatalog from '../../components/ServicesCatalog';
import { discoverServices } from '../../lib/serviceCatalog';
import { getServiceStatus } from '../../lib/docker';
import type { ServiceMetadata } from '../../lib/serviceCatalog';
import type { ServiceStatus } from '../../lib/docker';

async function getServices() {
  try {
    const services = await discoverServices();
    
    // Get status for each service
    const servicesWithStatus = await Promise.all(
      services.map(async (service) => {
        const status = await getServiceStatus(service.containerName);
        return {
          ...service,
          status
        };
      })
    );
    
    return servicesWithStatus;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();
  const runningCount = services.filter((s: any) => s.status === 'running').length;

  return (
    <div>
      <div className="section">
        <h1 className="heading" style={{ fontSize: 28 }}>Service Catalog</h1>
        <p className="muted" style={{ marginBottom: 8 }}>
          Manage your Seiling Buidlbox v2 services. {runningCount} of {services.length} running.
        </p>
        <a href="/" style={{ color: 'var(--sbx-blue)', textDecoration: 'none' }}>← Back to Home</a>
      </div>

      {services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">No services found. Ensure docker/services/ directory contains compose files.</p>
        </div>
      ) : (
        <ServicesCatalog initialServices={services} />
      )}
    </div>
  );
}

