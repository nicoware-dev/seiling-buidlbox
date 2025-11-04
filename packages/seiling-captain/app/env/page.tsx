export const dynamic = 'force-dynamic';
export const revalidate = 0;
import EnvEditor from '../../components/EnvEditor';
import { parseEnvFile, parseEnvSchema, getEnvPaths } from '../../lib/env';

async function getEnvData() {
  try {
    const paths = getEnvPaths();

    const vars = parseEnvFile(paths.env);
    const schema = parseEnvSchema(paths.example);

    const varsRecord: Record<string, string> = {};
    for (const variable of vars) {
      varsRecord[variable.key] = variable.value;
    }

    return { vars: varsRecord, schema };
  } catch (error) {
    console.error('Error loading env data:', error);
    return { vars: {}, schema: {} };
  }
}

export default async function EnvPage() {
  const { vars, schema } = await getEnvData();

  return (
    <div>
      <div style={{ marginBottom: '16px', padding: '24px 24px 0' }}>
        <a
          href="/"
          style={{ color: '#2563eb', textDecoration: 'none' }}
        >
          ← Back to Home
        </a>
      </div>
      <EnvEditor initialVars={vars} schema={schema} />
    </div>
  );
}

