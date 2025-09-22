#!/usr/bin/env node

/* MIT License
 *
 * Copyright (c) 2023 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { google } = require('googleapis');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const DatabaseHelper = require('./database-helper');

// Configuration
const GOOGLE_SHEETS_CONFIG = {
    // These should be set as environment variables
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:A', // Column A contains Bungie names
    credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
    }
};

const DCLI_CONFIG = {
    dataDir: process.env.DCLI_DATA_DIR || '/data/',
    apiKey: process.env.BUNGIE_API_KEY
};

class UserSyncManager {
    constructor() {
        this.sheets = null;
        this.dbPath = path.join(DCLI_CONFIG.dataDir, 'dcli.sqlite3');
        this.dbHelper = new DatabaseHelper(this.dbPath);
    }

    async initializeGoogleSheets() {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: GOOGLE_SHEETS_CONFIG.credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });

            this.sheets = google.sheets({ version: 'v4', auth });
            console.log('Google Sheets API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Sheets API:', error.message);
            throw error;
        }
    }

    async getUsersFromSheet() {
        if (!this.sheets) {
            throw new Error('Google Sheets API not initialized');
        }

        try {
            console.log(`Reading users from sheet: ${GOOGLE_SHEETS_CONFIG.spreadsheetId}`);
            console.log(`Range: ${GOOGLE_SHEETS_CONFIG.range}`);
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
                range: GOOGLE_SHEETS_CONFIG.range,
            });

            const rows = response.data.values || [];
            const users = rows
                .map(row => row[0]?.trim()) // Get first column value
                .filter(name => name && name.length > 0) // Filter out empty values
                .filter(name => name.includes('#')) // Basic validation for Bungie name format
                .map(name => name.toLowerCase()); // Normalize to lowercase

            console.log(`Found ${users.length} users in Google Sheet:`, users);
            return users;
        } catch (error) {
            console.error('Failed to read from Google Sheet:', error.message);
            throw error;
        }
    }

    async getExistingUsers() {
        try {
            // First try to use database helper for more reliable checking
            if (this.dbHelper.connect()) {
                const users = this.dbHelper.getExistingUsers();
                this.dbHelper.disconnect();
                return users;
            }

            // Fallback to dclisync command if database is not available
            console.log('Database not available, trying dclisync command...');
            const command = `dclisync --data-dir ${DCLI_CONFIG.dataDir} --api-key ${DCLI_CONFIG.apiKey} --list`;
            
            console.log('Checking existing users with command:', command.replace(DCLI_CONFIG.apiKey, '[REDACTED]'));
            
            const output = execSync(command, { 
                encoding: 'utf8',
                timeout: 30000 // 30 second timeout
            });

            // Parse the output to extract user names
            // The output format may vary, so we'll look for Bungie name patterns
            const lines = output.split('\n');
            const existingUsers = lines
                .map(line => line.trim())
                .filter(line => line.includes('#'))
                .map(name => name.toLowerCase());

            console.log(`Found ${existingUsers.length} existing users:`, existingUsers);
            return existingUsers;
        } catch (error) {
            console.error('Failed to get existing users:', error.message);
            // If both methods fail, assume no users exist yet
            return [];
        }
    }

    async addUser(bungieName) {
        try {
            const command = `dclisync --data-dir ${DCLI_CONFIG.dataDir} --api-key ${DCLI_CONFIG.apiKey} --add ${bungieName}`;
            
            console.log(`Adding user: ${bungieName}`);
            console.log('Command:', command.replace(DCLI_CONFIG.apiKey, '[REDACTED]'));
            
            const output = execSync(command, { 
                encoding: 'utf8',
                timeout: 60000 // 60 second timeout for user addition
            });

            console.log(`Successfully added user: ${bungieName}`);
            console.log('Output:', output);
            return true;
        } catch (error) {
            console.error(`Failed to add user ${bungieName}:`, error.message);
            return false;
        }
    }

    async syncUsers() {
        try {
            console.log('Starting user sync process...');
            
            // Check if Google Sheets is configured
            if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
                console.log('Google Sheets not configured. Skipping user sync.');
                return;
            }
            
            // Initialize Google Sheets API
            await this.initializeGoogleSheets();
            
            // Get users from Google Sheet
            const sheetUsers = await this.getUsersFromSheet();
            if (sheetUsers.length === 0) {
                console.log('No users found in Google Sheet');
                return;
            }

            // Get existing users from dcli database
            const existingUsers = await this.getExistingUsers();
            
            // Find users that need to be added
            const usersToAdd = sheetUsers.filter(user => !existingUsers.includes(user.toLowerCase()));
            
            if (usersToAdd.length === 0) {
                console.log('All users from Google Sheet are already added');
                return;
            }

            console.log(`Found ${usersToAdd.length} new users to add:`, usersToAdd);

            // Add each new user
            const results = [];
            for (const user of usersToAdd) {
                const success = await this.addUser(user);
                results.push({ user, success });
                
                // Add a small delay between user additions to avoid rate limiting
                if (usersToAdd.indexOf(user) < usersToAdd.length - 1) {
                    console.log('Waiting 2 seconds before adding next user...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            // Log results
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);
            
            console.log(`User sync completed:`);
            console.log(`  Successfully added: ${successful.length} users`);
            console.log(`  Failed to add: ${failed.length} users`);
            
            if (failed.length > 0) {
                console.log('Failed users:', failed.map(f => f.user));
            }

        } catch (error) {
            console.error('User sync failed:', error.message);
            process.exit(1);
        }
    }
}

// Main execution
if (require.main === module) {
    const userSync = new UserSyncManager();
    userSync.syncUsers().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = UserSyncManager;
