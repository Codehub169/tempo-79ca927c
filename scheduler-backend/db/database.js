import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_PATH = path.join(__dirname, 'scheduler.db');

let db;

export const initializeDatabase = async () => {
    if (db) {
        console.log('Database already initialized.');
        return db;
    }

    try {
        db = await open({
            filename: DATABASE_PATH,
            driver: sqlite3.Database
        });

        console.log(`Connected to SQLite database: ${DATABASE_PATH}`);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                parameters TEXT, -- Store as JSON string
                schedule_type TEXT NOT NULL,
                schedule_value TEXT, -- For 'once', 'daily', 'custom'
                schedule_day INTEGER, -- For 'weekly' (0-6)
                schedule_time TEXT, -- For 'weekly'
                lastRun TEXT, -- ISO string
                nextRun TEXT, -- ISO string, or 'N/A', 'Completed'
                status TEXT NOT NULL DEFAULT 'Active' -- Active, Completed, Paused, Failed
            );

            CREATE TABLE IF NOT EXISTS execution_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                taskId TEXT NOT NULL,
                taskName TEXT NOT NULL,
                executionTime TEXT NOT NULL, -- ISO string
                status TEXT NOT NULL, -- Completed, Failed
                output TEXT,
                FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
            );
        `);
        console.log('Database tables ensured.');
        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
};

// Ensure database is closed on application exit
process.on('exit', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
});

process.on('SIGINT', () => {
    process.exit();
});
