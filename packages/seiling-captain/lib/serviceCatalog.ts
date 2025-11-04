import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface ServiceMetadata {
  id: string; // Service identifier (e.g., 'n8n', 'postgres')
  name: string; // Display name
  containerName: string; // Docker container name
  composeFile: string; // Path to compose file (e.g., 'docker/services/docker-compose.n8n.yml')
  ports: Array<{ host: string; container: string; protocol?: string }>;
  healthCheck?: {
    endpoint?: string;
    test?: string[];
  };
  dependsOn?: string[];
  enableFlag?: string; // ENABLE_* env var name
  description?: string;
}

/**
 * Find the Seiling Buidlbox v2 repository root by walking up from current directory
 * until we find docker/services/ directory
 */
export function findRepoRoot(startDir: string = process.cwd()): string {
  let currentDir = path.resolve(startDir);
  
  // Walk up the directory tree looking for docker/services/
  while (currentDir !== path.dirname(currentDir)) {
    const dockerServicesDir = path.join(currentDir, 'docker', 'services');
    if (fs.existsSync(dockerServicesDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback to current directory if not found
  return startDir;
}

/**
 * Discover Seiling Buidlbox v2 services by scanning docker/services/ directory
 * for compose files and extracting service metadata
 */
export async function discoverServices(repoRoot?: string): Promise<ServiceMetadata[]> {
  // Auto-detect repo root if not provided
  const actualRepoRoot = repoRoot || findRepoRoot();
  const servicesDir = path.join(actualRepoRoot, 'docker', 'services');
  
  if (!fs.existsSync(servicesDir)) {
    return [];
  }

  // Find all Seiling Buidlbox v2 compose files following the standard naming convention
  const composeFiles = fs.readdirSync(servicesDir)
    .filter(file => file.startsWith('docker-compose.') && file.endsWith('.yml'))
    .map(file => path.join(servicesDir, file));

  const services: ServiceMetadata[] = [];

  for (const composeFile of composeFiles) {
    try {
      const fileContent = fs.readFileSync(composeFile, 'utf-8');
      const compose = yaml.load(fileContent) as any;

      if (!compose || !compose.services) {
        continue;
      }

      // Extract base name from filename (e.g., 'docker-compose.n8n.yml' -> 'n8n')
      const filename = path.basename(composeFile);
      const baseName = filename.replace(/^docker-compose\./, '').replace(/\.yml$/, '');

      // Process each service in the compose file
      for (const [serviceKey, serviceDef] of Object.entries(compose.services as Record<string, any>)) {
        const service = serviceDef as any;
        
        // Get container name (from container_name or default to seiling-{serviceKey})
        const containerName = service.container_name || `seiling-${serviceKey}`;
        
        // Extract service ID - use the base filename as primary identifier
        // For single-service files, use baseName; for multi-service, use serviceKey
        const serviceId = Object.keys(compose.services).length === 1 ? baseName : serviceKey;

        // Extract ports
        const ports: ServiceMetadata['ports'] = [];
        if (service.ports) {
          for (const portMapping of Array.isArray(service.ports) ? service.ports : [service.ports]) {
            if (typeof portMapping === 'string') {
              // Format: "5001:5678" or "5001:5678/tcp"
              const [mapping, protocol] = portMapping.split('/');
              const [host, container] = mapping.split(':');
              if (host && container) {
                ports.push({ host, container, protocol: protocol || 'tcp' });
              }
            } else if (typeof portMapping === 'object' && portMapping.published && portMapping.target) {
              // New format: { published: 5001, target: 5678 }
              ports.push({
                host: String(portMapping.published),
                container: String(portMapping.target),
                protocol: portMapping.protocol || 'tcp'
              });
            }
          }
        }

        // Extract health check
        let healthCheck: ServiceMetadata['healthCheck'] | undefined;
        if (service.healthcheck) {
          healthCheck = {
            test: Array.isArray(service.healthcheck.test)
              ? service.healthcheck.test
              : service.healthcheck.test ? [service.healthcheck.test] : [],
          };

          // Try to extract HTTP endpoint from healthcheck test
          if (healthCheck.test && healthCheck.test.length > 0) {
            const testStr = healthCheck.test.join(' ');
            const httpMatch = testStr.match(/http:\/\/[^\s"']+|https:\/\/[^\s"']+|:\/([^\s"']+)/);
            if (httpMatch) {
              healthCheck.endpoint = httpMatch[0].replace(/^http:\/\//, '').replace(/^https:\/\//, '');
            }
          }
        }

        // Extract dependencies
        const dependsOn = service.depends_on
          ? Array.isArray(service.depends_on)
            ? service.depends_on
            : Object.keys(service.depends_on)
          : undefined;

        // Extract enable flag from environment variables
        let enableFlag: string | undefined;
        if (service.environment) {
          const env = service.environment;
          const envArray = Array.isArray(env)
            ? env
            : typeof env === 'object'
            ? Object.entries(env).map(([k, v]) => `${k}=${v}`)
            : [];

          for (const envVar of envArray) {
            if (typeof envVar === 'string' && envVar.startsWith('ENABLE_')) {
              enableFlag = envVar.split('=')[0];
              break;
            } else if (typeof envVar === 'object' && 'ENABLE_' in envVar) {
              enableFlag = Object.keys(envVar).find(k => k.startsWith('ENABLE_'));
              break;
            }
          }
        }

        services.push({
          id: serviceId,
          name: serviceId.charAt(0).toUpperCase() + serviceId.slice(1).replace(/-/g, ' '),
          containerName,
          composeFile: composeFile.replace(actualRepoRoot + path.sep, '').replace(/\\/g, '/'),
          ports,
          healthCheck,
          dependsOn,
          enableFlag,
        });
      }
    } catch (error) {
      console.error(`Error parsing compose file ${composeFile}:`, error);
      // Continue with other files
    }
  }

  return services;
}

/**
 * Get a single Seiling Buidlbox v2 service by ID
 */
export async function getServiceById(
  serviceId: string,
  repoRoot?: string
): Promise<ServiceMetadata | null> {
  const services = await discoverServices(repoRoot);
  return services.find(s => s.id === serviceId) || null;
}

