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

const UserSyncManager = require('./user-sync');
const DatabaseHelper = require('./database-helper');
const path = require('path');

async function testUserSync() {
    console.log('=== DARCI User Sync Test ===\n');
    
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...');
    const requiredVars = [
        'BUNGIE_API_KEY',
        'GOOGLE_SHEET_ID',
        'GOOGLE_PROJECT_ID',
        'GOOGLE_PRIVATE_KEY_ID',
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_CLIENT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing environment variables:', missingVars);
        console.log('Please set these variables to test the Google Sheets integration.\n');
    } else {
        console.log('✅ All required environment variables are set.\n');
    }
    
    // Test 2: Check database connection
    console.log('2. Testing database connection...');
    const dbPath = path.join(process.env.DCLI_DATA_DIR || '/data/', 'dcli.sqlite3');
    const dbHelper = new DatabaseHelper(dbPath);
    
    if (dbHelper.connect()) {
        console.log('✅ Database connection successful');
        const existingUsers = dbHelper.getExistingUsers();
        console.log(`   Found ${existingUsers.length} existing users in database`);
        dbHelper.disconnect();
    } else {
        console.log('❌ Database connection failed (this is normal if no users have been added yet)');
    }
    console.log();
    
    // Test 3: Test Google Sheets connection (if configured)
    if (process.env.GOOGLE_SHEET_ID) {
        console.log('3. Testing Google Sheets connection...');
        try {
            const userSync = new UserSyncManager();
            await userSync.initializeGoogleSheets();
            console.log('✅ Google Sheets API initialized successfully');
            
            const sheetUsers = await userSync.getUsersFromSheet();
            console.log(`   Found ${sheetUsers.length} users in Google Sheet:`, sheetUsers);
        } catch (error) {
            console.log('❌ Google Sheets connection failed:', error.message);
        }
        console.log();
    } else {
        console.log('3. Skipping Google Sheets test (not configured)\n');
    }
    
    // Test 4: Test dclisync command availability
    console.log('4. Testing dclisync command availability...');
    try {
        const { execSync } = require('child_process');
        const output = execSync('dclisync --help', { encoding: 'utf8', timeout: 5000 });
        console.log('✅ dclisync command is available');
    } catch (error) {
        console.log('❌ dclisync command not available:', error.message);
    }
    console.log();
    
    console.log('=== Test Complete ===');
    console.log('To run the actual user sync, execute: node scripts/user-sync.js');
}

if (require.main === module) {
    testUserSync().catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}

module.exports = testUserSync;
