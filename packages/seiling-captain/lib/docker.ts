import { z } from 'zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';
import fs from 'fs';
import { getServiceById } from './serviceCatalog';

const execAsync = promisify(exec);

export const allowedActionsSchema = z.object({
  action: z.enum(['up', 'down', 'restart']),
  service: z.string().min(1)
});

export type AllowedAction = z.infer<typeof allowedActionsSchema>["action"];

export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'unknown';

/**
 * Detect which docker compose command is available
 */
async function getDockerComposeCommand(): Promise<string> {
  try {
    await execAsync('docker compose version');
    return 'docker compose';
  } catch {
    try {
      await execAsync('docker-compose --version');
      return 'docker-compose';
    } catch {
      throw new Error('Neither docker compose nor docker-compose found');
    }
  }
}

/**
 * Get service status by checking if container is running
 */
export async function getServiceStatus(
  containerName: string
): Promise<ServiceStatus> {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter name=^${containerName}$ --format "{{.Status}}"`
    );
    
    if (!stdout.trim()) {
      return 'stopped';
    }

    const status = stdout.trim().toLowerCase();
    if (status.includes('healthy')) {
      return 'running';
    } else if (status.includes('starting') || status.includes('health: starting')) {
      return 'starting';
    } else if (status.includes('up')) {
      return 'running';
    }
    
    return 'unknown';
  } catch (error) {
    // Container doesn't exist or error checking
    return 'stopped';
  }
}

/**
 * Get Seiling Buidlbox v2 service logs
 */
export async function getServiceLogs(
  containerName: string,
  lines: number = 100,
  follow: boolean = false
): Promise<string> {
  try {
    const command = follow
      ? `docker logs -f --tail ${lines} ${containerName}`
      : `docker logs --tail ${lines} ${containerName}`;
    
    // For non-follow mode, we can use execAsync
    if (!follow) {
      const { stdout, stderr } = await execAsync(command);
      return stderr ? `${stdout}\n${stderr}` : stdout;
    }
    
    // For follow mode, we need to handle streaming differently
    // This will be handled in the API route for SSE
    throw new Error('Follow mode should be handled via streaming API');
  } catch (error) {
    if (error instanceof Error && error.message.includes('streaming')) {
      throw error;
    }
    throw new Error(`Failed to get logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a Seiling Buidlbox v2 service action (up, down, restart)
 * Works with auto-discovered services from serviceCatalog
 */
export async function executeServiceAction(
  params: { action: AllowedAction; service: string },
  repoRoot?: string
) {
  const { action, service } = params;

  // Auto-detect repo root if not provided
  const { findRepoRoot } = await import('./serviceCatalog');
  const actualRepoRoot = repoRoot || findRepoRoot();

  // First try to get service from catalog
  let composeFile: string | null = null;
  let containerName: string | null = null;

  try {
    const serviceMeta = await getServiceById(service, actualRepoRoot);
    if (serviceMeta) {
      composeFile = path.join(actualRepoRoot, serviceMeta.composeFile);
      containerName = serviceMeta.containerName;
    }
  } catch (error) {
    // Fall back to hardcoded mapping
  }

  // Fallback mapping for Seiling Buidlbox v2 services if not found in catalog
  // These match the standard Seiling Buidlbox v2 service naming convention
  const SERVICE_TO_COMPOSE: Record<string, string> = {
    captain: 'docker/services/docker-compose.captain.yml',
    builder: 'docker/services/docker-compose.builder.yml',
    'os-server': 'docker/services/docker-compose.os.yml',
    'os-ui': 'docker/services/docker-compose.os.yml',
    auditor: 'docker/services/docker-compose.auditor.yml',
    searxng: 'docker/services/docker-compose.searxng.yml',
    kokoro: 'docker/services/docker-compose.kokoro-chatterbox.yml',
    supabase: 'docker/services/docker-compose.supabase.yml'
  };

  if (!composeFile) {
    if (!Object.prototype.hasOwnProperty.call(SERVICE_TO_COMPOSE, service)) {
      throw new Error(`Service "${service}" not found in Seiling Buidlbox v2 catalog`);
    }
    composeFile = path.join(actualRepoRoot, SERVICE_TO_COMPOSE[service]);
  }

  // Verify compose file exists
  if (!fs.existsSync(composeFile)) {
    throw new Error(`Compose file not found: ${composeFile}`);
  }

  const dockerComposeCmd = await getDockerComposeCommand();
  const baseCmd = dockerComposeCmd === 'docker compose'
    ? `docker compose -f ${composeFile}`
    : `docker-compose -f ${composeFile}`;

  let command = '';
  try {
    if (action === 'up') {
      command = `${baseCmd} up -d --remove-orphans`;
    } else if (action === 'down') {
      command = `${baseCmd} down`;
    } else if (action === 'restart') {
      command = `${baseCmd} restart || (${baseCmd} down && ${baseCmd} up -d --remove-orphans)`;
    } else {
      throw new Error(`Invalid action: ${action}`);
    }

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      timeout: 120000 // 2 minute timeout
    });

    return {
      ok: true,
      stdout,
      stderr,
      command
    };
  } catch (error: any) {
    const errorMessage = error?.stderr || error?.message || 'Unknown error';
    return {
      ok: false,
      stdout: error?.stdout || '',
      stderr: errorMessage,
      command,
      error: errorMessage
    };
  }
}


