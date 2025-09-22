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

# Initialize schemas and add user data
echo "Initializing schemas and adding user data..."
if dclisync --data-dir /data/ --api-key $BUNGIE_API_KEY --add goss#5817; then
    echo "Schema initialization and user data sync completed successfully"
else
    echo "Warning: Schema initialization failed. This may be due to missing API credentials or network issues."
fi

# Start the Express server (serves both API and static files)
echo "Starting DARCI server..."
echo "Current directory: $(pwd)"
echo "Contents of /data:"
ls -la /data/

cd /app/server
echo "Starting server in directory: $(pwd)"
echo "Server will listen on 0.0.0.0:8080"
echo "Environment variables:"
echo "  NODE_ENV: $NODE_ENV"
echo "  DCLI_DB_PATH: $DCLI_DB_PATH"
echo "  MANIFEST_DB_PATH: $MANIFEST_DB_PATH"
echo "  MANIFEST_INFO_PATH: $MANIFEST_INFO_PATH"

# Start supercronic in the background for cron jobs
echo "Starting supercronic for cron jobs..."
supercronic /app/crontab &

# Start the Express server in the foreground
exec node server.js
