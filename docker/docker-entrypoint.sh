#!/bin/sh

# Set database paths for dcli tools
export DCLI_DB_PATH=${DCLI_DB_PATH:-/data/dcli.sqlite3}
export MANIFEST_DB_PATH=${MANIFEST_DB_PATH:-/data/manifest.sqlite3}
export MANIFEST_INFO_PATH=${MANIFEST_INFO_PATH:-/data/manifest_info.json}
export DCLI_FIX_DATA=true

echo "Database paths set:"
echo "  DCLI_DB_PATH: $DCLI_DB_PATH"
echo "  MANIFEST_DB_PATH: $MANIFEST_DB_PATH"
echo "  MANIFEST_INFO_PATH: $MANIFEST_INFO_PATH"

# Check if we have Bungie API credentials
if [ -z "$BUNGIE_API_KEY" ]; then
    echo "Warning: BUNGIE_API_KEY not set. dcli tools may not work properly."
    echo "Please set your Bungie API credentials in Fly.io dashboard or via fly CLI"
fi

# Always try to sync destiny manifest (even without API key for basic schema)
echo "Attempting to sync Destiny 2 manifest..."
if dclim --verbose -D /data/; then
    echo "Manifest sync completed successfully"
else
    echo "Warning: Manifest sync failed. This may be due to missing API credentials."
    
fi

# Start the Express server (serves both API and static files)
echo "Starting DARCI server..."
echo "Current directory: $(pwd)"
echo "Contents of /app/server:"
ls -la /app/server/
echo "Contents of /app/server/node_modules:"
ls -la /app/server/node_modules/ | head -10
echo "Checking if shared module exists:"
ls -la /app/server/node_modules/shared/ || echo "Shared module not found in node_modules"
echo "Checking if server.js exists:"
ls -la /app/server/server.js || echo "server.js not found"

cd /app/server
exec node server.js
