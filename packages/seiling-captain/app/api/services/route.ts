import { NextRequest, NextResponse } from 'next/server';
import { executeServiceAction, allowedActionsSchema, type AllowedAction, getServiceStatus } from '../../../lib/docker';
import { discoverServices, findRepoRoot } from '../../../lib/serviceCatalog';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
const execAsync = promisify(exec);
import { checkRateLimit, getClientId } from '../../../lib/rateLimit';

/**
 * Security: Check if request is from localhost
 */
function isLocalhost(req: NextRequest): boolean {
  const forwarded = req.headers.get('x-forwarded-for');
  const host = req.headers.get('host') || '';
  const url = new URL(req.url);
  
  // Check if hostname is localhost or 127.0.0.1
  if (host.includes('localhost') || host.includes('127.0.0.1') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return true;
  }
  
  // Check forwarded header
  if (forwarded && (forwarded.includes('127.0.0.1') || forwarded.includes('localhost'))) {
    return true;
  }
  
  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

/**
 * GET /api/services - List all services with their status
 */
export async function GET(req: NextRequest) {
  try {
    // Security check
    if (!isLocalhost(req)) {
      return NextResponse.json(
        { ok: false, error: 'Access denied. This API is only available from localhost.' },
        { status: 403 }
      );
    }

    const repoRoot = findRepoRoot();
    let services = await discoverServices(repoRoot);
    
    // Fallback: if discovery failed, synthesize from Docker
    if (!services || services.length === 0) {
      try {
        const { stdout } = await execAsync('docker ps -a --format "{{.Names}}|{{.Ports}}" --filter name=seiling-');
        const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
        services = lines.map(line => {
          const [name, portsStr] = line.split('|');
          const id = name.replace(/^seiling-/, '');
          const ports = [] as Array<{ host: string; container: string; protocol?: string }>;
          if (portsStr) {
            portsStr.split(',').forEach(p => {
              const m = p.trim().match(/(\d+)->(\d+)\/?(\w+)?/);
              if (m) ports.push({ host: m[1], container: m[2], protocol: m[3] || 'tcp' });
            });
          }
          return {
            id,
            name: id,
            containerName: name,
            composeFile: '',
            ports,
          } as any;
        });
      } catch (_) {
        // ignore; will return empty below
      }
    }
    
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

    // Debug details when requested
    const url = new URL(req.url);
    if (url.searchParams.get('debug') === '1') {
      return NextResponse.json({
        ok: true,
        repoRoot,
        envRoot: process.env.REPO_ROOT,
        cwd: process.cwd(),
        count: servicesWithStatus.length,
        services: servicesWithStatus,
      });
    }

    return NextResponse.json({ ok: true, services: servicesWithStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services - Execute a service action (up, down, restart)
 */
export async function POST(req: NextRequest) {
  try {
    // Security check
    if (!isLocalhost(req)) {
      return NextResponse.json(
        { ok: false, error: 'Access denied. This API is only available from localhost.' },
        { status: 403 }
      );
    }

    // Rate limiting (10 requests per minute for write operations)
    const clientId = getClientId(req as any);
    const rateLimit = checkRateLimit(`services:${clientId}`, 10, 60000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Rate limit exceeded. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          }
        }
      );
    }

    const body = await req.json();
    const parsed = allowedActionsSchema.parse(body);
    
    const { findRepoRoot } = await import('../../../lib/serviceCatalog');
    const repoRoot = findRepoRoot();
    const result = await executeServiceAction(
      parsed as { action: AllowedAction; service: string },
      repoRoot
    );

    if (result.ok) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body', details: error.message },
        { status: 400 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}


