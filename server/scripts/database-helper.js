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

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseHelper {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }

    connect() {
        try {
            if (!fs.existsSync(this.dbPath)) {
                console.log('Database does not exist yet');
                return false;
            }

            this.db = new Database(this.dbPath, { readonly: true });
            console.log(`Connected to database: ${this.dbPath}`);
            return true;
        } catch (error) {
            console.error('Failed to connect to database:', error.message);
            return false;
        }
    }

    disconnect() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    getExistingUsers() {
        if (!this.db) {
            console.log('Database not connected');
            return [];
        }

        try {
            // Query the members table to get existing users
            // The exact table structure may vary, but this is a common pattern
            const query = `
                SELECT DISTINCT bungie_display_name 
                FROM members 
                WHERE bungie_display_name IS NOT NULL 
                AND bungie_display_name != ''
                ORDER BY bungie_display_name
            `;

            const rows = this.db.prepare(query).all();
            const users = rows.map(row => row.bungie_display_name?.toLowerCase()).filter(name => name);
            
            console.log(`Found ${users.length} existing users in database`);
            return users;
        } catch (error) {
            console.error('Failed to query existing users:', error.message);
            
            // Try alternative table/column names
            try {
                const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
                console.log('Available tables:', tables.map(t => t.name));
                
                // Try to find a table that might contain user data
                for (const table of tables) {
                    try {
                        const columns = this.db.prepare(`PRAGMA table_info(${table.name})`).all();
                        console.log(`Table ${table.name} columns:`, columns.map(c => c.name));
                        
                        // Look for columns that might contain usernames
                        const nameColumns = columns.filter(c => 
                            c.name.toLowerCase().includes('name') || 
                            c.name.toLowerCase().includes('user') ||
                            c.name.toLowerCase().includes('display')
                        );
                        
                        if (nameColumns.length > 0) {
                            console.log(`Found potential name columns in ${table.name}:`, nameColumns.map(c => c.name));
                        }
                    } catch (e) {
                        // Ignore errors when examining table structure
                    }
                }
            } catch (e) {
                console.error('Failed to examine database structure:', e.message);
            }
            
            return [];
        }
    }

    getUserByBungieName(bungieName) {
        if (!this.db) {
            return null;
        }

        try {
            const query = `
                SELECT * FROM members 
                WHERE LOWER(bungie_display_name) = LOWER(?)
                LIMIT 1
            `;

            const user = this.db.prepare(query).get(bungieName);
            return user;
        } catch (error) {
            console.error(`Failed to query user ${bungieName}:`, error.message);
            return null;
        }
    }

    isUserExists(bungieName) {
        const user = this.getUserByBungieName(bungieName);
        return user !== undefined;
    }
}

module.exports = DatabaseHelper;
