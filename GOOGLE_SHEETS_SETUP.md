# Google Sheets Integration Setup

This document explains how to set up the Google Sheets integration for automatically adding users to DARCI from a Google Sheet.

## Overview

The Google Sheets integration allows you to maintain a list of Bungie usernames in a Google Sheet, and DARCI will automatically check for new users and add them to the dcli system for syncing.

## Setup Steps

### 1. Create a Google Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and enable it
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "darci-sheets-reader")
   - Click "Create and Continue"
   - Skip the optional steps and click "Done"
5. Create a key for the service account:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

### 2. Set up the Google Sheet

1. Create a new Google Sheet or use an existing one
2. Add Bungie usernames (in format `username#1234`) in column A
3. Share the sheet with the service account email (found in the JSON file as `client_email`)
4. Give the service account "Viewer" permissions
5. Note the Sheet ID from the URL (the long string between `/d/` and `/edit`)

### 3. Configure Environment Variables

Add the following environment variables to your deployment (Fly.io, Docker, etc.):

```bash
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SHEET_RANGE=Sheet1!A:A  # Optional, defaults to Sheet1!A:A

# Google Service Account Credentials (from the JSON file)
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40project.iam.gserviceaccount.com

# DCLI Configuration (should already be set)
BUNGIE_API_KEY=your_bungie_api_key
DCLI_DATA_DIR=/data/  # Optional, defaults to /data/
```

### 4. Deploy and Test

1. Deploy your application with the new environment variables
2. The user sync will run automatically every 6 hours
3. You can also run it manually by executing:
   ```bash
   cd /app/server
   node scripts/user-sync.js
   ```

## How It Works

1. **User Sync Cron Job**: Runs every 6 hours at 10 minutes past the hour
2. **Reads Google Sheet**: Fetches all Bungie usernames from column A
3. **Checks Existing Users**: Queries the dcli database to see which users are already added
4. **Adds New Users**: Uses `dclisync --add` command to add any new users found in the sheet
5. **Logs Results**: All activity is logged to `/data/cron.log`

## Troubleshooting

### Check Logs
```bash
# View the cron log
tail -f /data/cron.log

# Check for user sync entries
grep "user sync" /data/cron.log
```

### Manual Testing
```bash
# Test the user sync script manually
cd /app/server
node scripts/user-sync.js
```

### Common Issues

1. **Permission Denied**: Make sure the service account has access to the Google Sheet
2. **Invalid Credentials**: Double-check all the environment variables are set correctly
3. **Sheet Not Found**: Verify the GOOGLE_SHEET_ID is correct
4. **No Users Added**: Check that the usernames in the sheet are in the correct format (`username#1234`)

## Security Notes

- The service account only needs read access to the Google Sheet
- Store all credentials securely as environment variables
- The private key should be properly escaped when setting as an environment variable
- Consider rotating the service account key periodically

## Customization

You can customize the behavior by modifying:
- **Sync Frequency**: Change the cron schedule in `crontab`
- **Sheet Range**: Modify `GOOGLE_SHEET_RANGE` to read from different columns
- **User Validation**: Update the validation logic in `user-sync.js`
- **Error Handling**: Enhance error handling and retry logic as needed
