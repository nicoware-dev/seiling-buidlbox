const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');

const NODES_DIR = path.join(__dirname, '../nodes');
const N8N_NODES_DIR = path.join(require('os').homedir(), '.n8n/nodes');

let isBuilding = false;

function buildAndInstall() {
  if (isBuilding) return;
  isBuilding = true;
  
  console.log('🔨 Building nodes...');
  
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      isBuilding = false;
      return;
    }
    
    console.log('✅ Build completed');
    console.log('📦 Packing and installing...');
    
    exec('npm pack', (packError, packStdout, packStderr) => {
      if (packError) {
        console.error('❌ Pack failed:', packError);
        isBuilding = false;
        return;
      }
      
      const tarball = packStdout.trim().split('\n').pop();
      const installCmd = `cd "${N8N_NODES_DIR}" && npm install "${path.join(__dirname, '..', tarball)}" --force`;
      
      exec(installCmd, (installError, installStdout, installStderr) => {
        if (installError) {
          console.error('❌ Install failed:', installError);
        } else {
          console.log('🚀 Nodes installed successfully! Restart n8n to see changes.');
        }
        isBuilding = false;
      });
    });
  });
}

console.log('👀 Watching for changes in', NODES_DIR);
console.log('🔄 Auto-rebuild and install enabled');

// Watch for changes
const watcher = chokidar.watch(NODES_DIR, {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${path.relative(NODES_DIR, filePath)}`);
  setTimeout(buildAndInstall, 500); // Debounce
});

// Initial build
buildAndInstall(); 