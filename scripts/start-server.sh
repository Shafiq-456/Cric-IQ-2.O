#!/bin/bash
# Persistent dev server startup script
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js dev server on port 3000..."
  npx next dev -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 2s..."
  sleep 2
done