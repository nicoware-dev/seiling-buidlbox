import Link from 'next/link';

async function getServiceStats() {
  try {
    const { discoverServices } = await import('../lib/serviceCatalog');
    const { getServiceStatus } = await import('../lib/docker');
    const services = await discoverServices();
    
    const servicesWithStatus = await Promise.all(
      services.map(async (service) => {
        const status = await getServiceStatus(service.containerName);
        return status;
      })
    );
    
    const runningCount = servicesWithStatus.filter(s => s === 'running').length;
    return { total: services.length, running: runningCount };
  } catch (error) {
    return { total: 0, running: 0 };
  }
}

export default async function Page() {
  const stats = await getServiceStats();

  return (
    <div>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Seiling Buidlbox" width="220" height="48" />
        <h1 className="hero-title heading">Seiling Captain</h1>
        <p className="hero-sub">Control plane for Seiling Buidlbox v2. Manage services, environment, and health.</p>
      </section>

      <div className="kpi" style={{ marginBottom: 24 }}>
        <div className="card kpi-card">
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">Total Services</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value" style={{ color: 'var(--sbx-green)' }}>{stats.running}</div>
          <div className="kpi-label">Running</div>
        </div>
      </div>

      <div className="grid" style={{ gap: 12 }}>
        <Link href="/services" className="card tile">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Service Catalog</div>
          <div className="muted">View and manage all services</div>
        </Link>
        <Link href="/env" className="card tile">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Environment Editor</div>
          <div className="muted">Edit and validate environment variables</div>
        </Link>
        <Link href="/logs" className="card tile">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Logs Viewer</div>
          <div className="muted">View and stream service logs</div>
        </Link>
      </div>
    </div>
  );
}


