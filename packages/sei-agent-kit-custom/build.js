import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Get all TypeScript files in src directory
function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function build() {
  try {
    const entryPoints = getAllTsFiles('./src');
    
    await esbuild.build({
      entryPoints,
      outdir: './dist',
      format: 'esm',
      target: 'es2020',
      platform: 'node',
      sourcemap: false,
      minify: false,
      keepNames: true,
      outExtension: { '.js': '.js' },
      allowOverwrite: true,
      logLevel: 'info'
    });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 