import { NextRequest, NextResponse } from 'next/server';
import { parseEnvFile, parseEnvSchema, writeEnvFile, backupEnvFile, validateEnvVariables, getEnvPaths, type EnvVariable } from '../../../lib/env';
import fs from 'fs';
import { checkRateLimit, getClientId } from '../../../lib/rateLimit';

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

/**
 * GET /api/env - Get current env variables and schema
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

    const paths = getEnvPaths();

    // Parse current .env
    const vars = parseEnvFile(paths.env);
    
    // Parse schema from env-example.env
    const schema = parseEnvSchema(paths.example);

    // Convert to Record format for frontend
    const varsRecord: Record<string, string> = {};
    for (const variable of vars) {
      varsRecord[variable.key] = variable.value;
    }

    const url = new URL(req.url);
    if (url.searchParams.get('debug') === '1') {
      return NextResponse.json({
        ok: true,
        paths,
        exists: { env: fs.existsSync(paths.env), example: fs.existsSync(paths.example) },
        vars: varsRecord,
        schema,
        variables: vars,
        envRoot: process.env.REPO_ROOT,
        cwd: process.cwd(),
      });
    }

    return NextResponse.json({ ok: true, vars: varsRecord, schema, variables: vars });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/env - Update env variables
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

    // Rate limiting (5 requests per minute for env writes - more restrictive)
    const clientId = getClientId(req as any);
    const rateLimit = checkRateLimit(`env:${clientId}`, 5, 60000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Rate limit exceeded. Please wait before making more changes.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      );
    }

    const body = await req.json();
    const { vars } = body;

    if (!vars || typeof vars !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body. Expected { vars: Record<string, string> }' },
        { status: 400 }
      );
    }

    const paths = getEnvPaths();

    // Parse schema for validation
    const schema = parseEnvSchema(paths.example);

    // Convert to EnvVariable array
    const variables: EnvVariable[] = Object.entries(vars).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    // Validate
    const validation = validateEnvVariables(variables, schema);
    if (!validation.valid) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Create backup
    const backupPath = backupEnvFile(paths.env);
    
    // Preserve section information from existing file if it exists
    const existingVars = parseEnvFile(paths.env);
    const existingVarMap = new Map(existingVars.map(v => [v.key, v]));
    
    // Merge with section info
    const variablesWithSections = variables.map(v => ({
      ...v,
      section: existingVarMap.get(v.key)?.section,
      comment: existingVarMap.get(v.key)?.comment,
    }));

    // Write new .env file
    writeEnvFile(paths.env, variablesWithSections);

    return NextResponse.json({
      ok: true,
      message: 'Environment file updated successfully',
      backup: backupPath,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

