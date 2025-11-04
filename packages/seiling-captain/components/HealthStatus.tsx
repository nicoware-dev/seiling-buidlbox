import type { HealthStatus } from '../lib/health';

interface HealthStatusProps {
  status: HealthStatus;
  lastCheck?: string;
  details?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HealthStatus({ 
  status, 
  lastCheck, 
  details,
  size = 'sm'
}: HealthStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'badge badge-green';
      case 'unhealthy':
        return 'badge badge-red';
      default:
        return 'badge badge-yellow';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'unhealthy':
        return 'Unhealthy';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      default:
        return '?';
    }
  };

  const sizeStyles = size === 'sm' ? { padding: '2px 6px', fontSize: 11 } : size === 'md' ? { padding: '4px 8px', fontSize: 12 } : { padding: '8px 12px', fontSize: 14 };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className={getStatusColor()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...sizeStyles }}>
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </span>
      {lastCheck && (
        <span style={{ fontSize: 11, color: '#6b7280' }} title={lastCheck}>
          {new Date(lastCheck).toLocaleTimeString()}
        </span>
      )}
      {details && (
        <span style={{ fontSize: 11, color: '#4b5563' }} title={details}>
          {details}
        </span>
      )}
    </div>
  );
}

