import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import http from 'http';
import https from 'https';

const execAsync = promisify(exec);

export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown';

export interface HealthCheckResult {
  status: HealthStatus;
  details?: string;
  lastCheck: string;
}

/**
 * Check if a Seiling Buidlbox v2 service container is running and healthy
 */
export async function checkContainerHealth(
  containerName: string
): Promise<HealthStatus> {
  try {
    // Check if container exists and is running
    const { stdout } = await execAsync(
      `docker ps --filter name=^${containerName}$ --format "{{.Status}}"`
    );
    
    if (!stdout.trim()) {
      return 'unhealthy';
    }

    const status = stdout.trim().toLowerCase();
    
    // Docker health check statuses
    if (status.includes('healthy')) {
      return 'healthy';
    } else if (status.includes('unhealthy')) {
      return 'unhealthy';
    } else if (status.includes('starting') || status.includes('health: starting')) {
      return 'unknown'; // Still starting
    } else if (status.includes('up')) {
      // Container is up but no explicit health status - check further
      return 'unknown';
    }
    
    return 'unhealthy';
  } catch (error) {
    return 'unhealthy';
  }
}

/**
 * Check HTTP endpoint health for Seiling Buidlbox v2 services
 */
export async function checkHttpHealth(
  url: string,
  timeout: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname || '/',
          method: 'GET',
          timeout,
        },
        (res) => {
          // Consider 2xx and 3xx as healthy
          resolve(res.statusCode ? res.statusCode >= 200 && res.statusCode < 400 : false);
          res.destroy();
        }
      );

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.setTimeout(timeout);
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Check database service health for Seiling Buidlbox v2 database services
 */
export async function checkDatabaseHealth(
  serviceName: string,
  containerName: string
): Promise<HealthStatus> {
  try {
    switch (serviceName.toLowerCase()) {
      case 'postgres':
      case 'postgresql': {
        const { stdout } = await execAsync(
          `docker exec ${containerName} pg_isready -U postgres 2>&1`
        );
        return stdout.includes('accepting connections') ? 'healthy' : 'unhealthy';
      }
      case 'redis': {
        // Check if redis container is healthy via docker status
        const containerStatus = await checkContainerHealth(containerName);
        if (containerStatus === 'healthy') {
          return 'healthy';
        }
        // Try ping command
        try {
          const { stdout } = await execAsync(
            `docker exec ${containerName} redis-cli ping 2>&1`
          );
          return stdout.includes('PONG') ? 'healthy' : 'unhealthy';
        } catch {
          return containerStatus;
        }
      }
      case 'neo4j': {
        // Check container status first
        const containerStatus = await checkContainerHealth(containerName);
        return containerStatus;
      }
      default:
        return await checkContainerHealth(containerName);
    }
  } catch (error) {
    return 'unhealthy';
  }
}

/**
 * Comprehensive health check for a Seiling Buidlbox v2 service
 */
export async function checkServiceHealth(
  containerName: string,
  serviceName?: string,
  httpEndpoint?: string,
  port?: string
): Promise<HealthCheckResult> {
  const lastCheck = new Date().toISOString();
  
  // First check container status
  let status = await checkContainerHealth(containerName);
  
  // If container is not running, return unhealthy immediately
  if (status === 'unhealthy') {
    return {
      status: 'unhealthy',
      details: 'Container is not running',
      lastCheck,
    };
  }

  // Try database-specific checks if applicable
  if (serviceName && ['postgres', 'postgresql', 'redis', 'neo4j'].includes(serviceName.toLowerCase())) {
    const dbStatus = await checkDatabaseHealth(serviceName, containerName);
    if (dbStatus !== 'unknown') {
      status = dbStatus;
    }
  }

  // Try HTTP endpoint check if provided
  if (httpEndpoint || port) {
    const host = process.env.BASE_DOMAIN_NAME || 'localhost';
    const endpoint = httpEndpoint || `http://${host}:${port}`;
    
    try {
      const httpHealthy = await checkHttpHealth(endpoint, 5000);
      if (httpHealthy && status === 'unknown') {
        status = 'healthy';
      } else if (!httpHealthy && status === 'unknown') {
        status = 'unhealthy';
        return {
          status,
          details: 'HTTP endpoint check failed',
          lastCheck,
        };
      }
    } catch (error) {
      // HTTP check failed but container is running - keep current status
    }
  }

  let details: string | undefined;
  if (status === 'healthy') {
    details = 'Service is running and healthy';
  } else if (status === 'unknown') {
    details = 'Container is running but health status unknown';
  } else {
    details = 'Service is unhealthy or not responding';
  }

  return {
    status,
    details,
    lastCheck,
  };
}

