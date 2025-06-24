// scheduler-backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';
import { initScheduledTasks } from './utils/cronScheduler.js';
import tasksRouter from './routes/tasks.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files for the React frontend
// In production, Vite builds to 'dist' in the frontend directory.
// So, we serve from '../frontend/dist' relative to this backend's location.
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes for the scheduler backend
// All scheduler API routes will be prefixed with /api/scheduler
app.use('/api/scheduler/tasks', tasksRouter);
app.use('/api/scheduler/history', tasksRouter); // History is also part of tasksRouter

// Fallback for any other requests: serve the index.html of the React app
// This allows client-side routing to work.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});

// Initialize database and scheduled tasks, then start the server
const startServer = async () => {
    try {
        await initializeDatabase();
        await initScheduledTasks(); // Schedule tasks that are in the database on startup

        app.listen(PORT, () => {
            console.log(`Codehub Scheduler Backend and Frontend serving on port ${PORT}`);
            console.log(`Access dashboard at http://localhost:${PORT}`);
            console.log(`Scheduler API available at http://localhost:${PORT}/api/scheduler`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Exit with error code
    }
};

startServer();
