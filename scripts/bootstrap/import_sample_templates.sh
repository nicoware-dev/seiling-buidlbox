#!/usr/bin/env bash
set -euo pipefail

echo "[INFO] Importing sample templates (demo profile)"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

if [ -d "$ROOT_DIR/resources/n8n" ]; then
  echo "[INFO] n8n templates present: $(ls -1 "$ROOT_DIR/resources/n8n" | wc -l) files"
fi
if [ -d "$ROOT_DIR/resources/flowise" ]; then
  echo "[INFO] Flowise templates present: $(ls -1 "$ROOT_DIR/resources/flowise" | wc -l) files"
fi
echo "[INFO] Demo templates import done (no-op placeholder)"

