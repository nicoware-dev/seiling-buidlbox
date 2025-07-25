import { execa } from 'execa';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PackageJson } from '../types';

/**
 * Build and publish package to npm
 */
export async function publishToNpm(
  cwd: string,
  packageJson: PackageJson,
  npmUsername: string
): Promise<void> {
  console.info(`Publishing as npm user: ${npmUsername}`);

  // Update npmPackage field if it's a placeholder or not set
  if (!packageJson.npmPackage || packageJson.npmPackage === '${NPM_PACKAGE}') {
    packageJson.npmPackage = packageJson.name;
    console.info(`Set npmPackage to: ${packageJson.npmPackage}`);

    // Save updated package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  }

  // Build the package
  console.info('Building package...');
  await execa('npm', ['run', 'build'], { cwd, stdio: 'inherit' });

  // Publish to npm with --ignore-scripts to prevent recursion
  console.info('Publishing to npm...');
  await execa('npm', ['publish', '--ignore-scripts'], { cwd, stdio: 'inherit' });

  console.log(`[√] Successfully published ${packageJson.name}@${packageJson.version} to npm`);
}
