import { NextRequest, NextResponse } from 'next/server';
import { discoverServices } from '../../../lib/serviceCatalog';
import { checkServiceHealth } from '../../../lib/health';

/**
 * Security: Check if request is from localhost
 */
function isLocalhost(req: NextRequest): boolean {
  const forwarded = req.headers.get('x-forwarded-for');
  const host = req.headers.get('host') || '';
  const url = new URL(req.url);
  
  if (host.includes('localhost') || host.includes('127.0.0.1') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return true;
  }
  
  if (forwarded && (forwarded.includes('127.0.0.1') || forwarded.includes('localhost'))) {
    return true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

// Simple in-memory cache
const healthCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL = 30000; // 30 seconds

/**
 * GET /api/health - Get health status for all services
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

    const cacheKey = 'all-services';
    
    // Check cache
    const cached = healthCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Discover all services
    const services = await discoverServices();
    
    // Check health for each service
    const healthResults: Record<string, any> = {};
    
    await Promise.all(
      services.map(async (service) => {
        try {
          // Extract first port for HTTP check
          const httpPort = service.ports && service.ports.length > 0 
            ? service.ports[0].host 
            : undefined;
          
          const healthEndpoint = service.healthCheck?.endpoint;
          
          const health = await checkServiceHealth(
            service.containerName,
            service.name.toLowerCase(),
            healthEndpoint ? `http://localhost:${httpPort}/${healthEndpoint}` : undefined,
            httpPort
          );
          
          healthResults[service.id] = health;
        } catch (error) {
          healthResults[service.id] = {
            status: 'unknown' as const,
            details: error instanceof Error ? error.message : 'Health check failed',
            lastCheck: new Date().toISOString(),
          };
        }
      })
    );

    const result = {
      ok: true,
      services: healthResults,
    };

    // Cache the result
    healthCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

