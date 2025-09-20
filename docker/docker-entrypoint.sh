#!/bin/sh

# Create data directory if it doesn't exist and set proper permissions
echo "Creating /data directory..."
mkdir -p /data
chmod 755 /data

# Verify directory was created and is writable
if [ ! -d "/data" ]; then
    echo "ERROR: Failed to create /data directory"
    exit 1
fi

if [ ! -w "/data" ]; then
    echo "ERROR: /data directory is not writable"
    exit 1
fi

echo "Data directory created successfully: $(ls -la /data)"

# Set database paths for dcli tools
export DCLI_DB_PATH=${DCLI_DB_PATH:-/data/darci.db}
export MANIFEST_DB_PATH=${MANIFEST_DB_PATH:-/data/manifest.db}
export MANIFEST_INFO_PATH=${MANIFEST_INFO_PATH:-/data/manifest_info.json}

echo "Database paths set:"
echo "  DCLI_DB_PATH: $DCLI_DB_PATH"
echo "  MANIFEST_DB_PATH: $MANIFEST_DB_PATH"
echo "  MANIFEST_INFO_PATH: $MANIFEST_INFO_PATH"

# Check if we have Bungie API credentials
if [ -z "$BUNGIE_API_KEY" ]; then
    echo "Warning: BUNGIE_API_KEY not set. dcli tools may not work properly."
    echo "Please set your Bungie API credentials in Fly.io dashboard or via fly CLI"
fi

# Sync destiny manifest (only if we have API key)
if [ -n "$BUNGIE_API_KEY" ]; then
    echo "Syncing Destiny 2 manifest..."
    dclim --verbose -D /data/
    
    # Sync user data (only if USER environment variable is set)
    if [ -n "$USER" ]; then
        echo "Syncing user data for: $USER"
        dclisync -D /data/ --add $USER
        dclisync -D /data/ --sync
    else
        echo "Warning: USER environment variable not set. Skipping user data sync."
        echo "To sync user data, set USER environment variable in Fly.io"
    fi
else
    echo "Skipping manifest and user sync due to missing API credentials"
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
