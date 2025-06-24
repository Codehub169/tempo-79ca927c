// scheduler-backend/models/Task.js
import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export class Task {
    static async getAll() {
        const db = getDb();
        return db.all('SELECT * FROM tasks');
    }

    static async getAllActive() {
        const db = getDb();
        // Active tasks are those that are not 'Completed' (for once-off) or 'Failed' (if that means no more runs)
        // For recurring tasks, they are always 'Active' unless manually paused/deleted.
        return db.all("SELECT * FROM tasks WHERE status = 'Active' OR status = 'Pending Calculation'");
    }

    static async getById(id) {
        const db = getDb();
        return db.get('SELECT * FROM tasks WHERE id = ?', id);
    }

    static async create(taskData) {
        const db = getDb();
        const id = uuidv4();
        const { name, endpoint, parameters, schedule } = taskData;
        const { type, value, day, time } = schedule;

        const result = await db.run(
            `INSERT INTO tasks (id, name, endpoint, parameters, schedule_type, schedule_value, schedule_day, schedule_time, lastRun, nextRun, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id,
            name,
            endpoint,
            JSON.stringify(parameters), // Store parameters as JSON string
            type,
            value || null,
            day || null,
            time || null,
            'N/A', // Initial lastRun
            'Pending Calculation', // Initial nextRun, will be updated by scheduler
            'Active' // Initial status
        );
        return { id, ...taskData, lastRun: 'N/A', nextRun: 'Pending Calculation', status: 'Active' };
    }

    static async update(id, taskData) {
        const db = getDb();
        const { name, endpoint, parameters, schedule, lastRun, nextRun, status } = taskData;
        const { type, value, day, time } = schedule || {}; // schedule might be undefined if only status/lastRun updated

        // Build the update query dynamically
        let query = 'UPDATE tasks SET';
        const params = [];
        const updates = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (endpoint !== undefined) { updates.push('endpoint = ?'); params.push(endpoint); }
        if (parameters !== undefined) { updates.push('parameters = ?'); params.push(JSON.stringify(parameters)); }
        if (schedule !== undefined) {
            updates.push('schedule_type = ?'); params.push(type);
            updates.push('schedule_value = ?'); params.push(value || null);
            updates.push('schedule_day = ?'); params.push(day || null);
            updates.push('schedule_time = ?'); params.push(time || null);
        }
        if (lastRun !== undefined) { updates.push('lastRun = ?'); params.push(lastRun); }
        if (nextRun !== undefined) { updates.push('nextRun = ?'); params.push(nextRun); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }

        query += ' ' + updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        await db.run(query, ...params);
        // After update, fetch the updated task to return the full object
        return this.getById(id);
    }

    static async delete(id) {
        const db = getDb();
        await db.run('DELETE FROM tasks WHERE id = ?', id);
        // Optionally, delete associated history or rely on ON DELETE CASCADE
    }

    static async addExecutionHistory(historyData) {
        const db = getDb();
        const { taskId, taskName, executionTime, status, output } = historyData;
        await db.run(
            `INSERT INTO execution_history (taskId, taskName, executionTime, status, output)
             VALUES (?, ?, ?, ?, ?)`,
            taskId,
            taskName,
            executionTime,
            status,
            output
        );
    }

    static async getExecutionHistory() {
        const db = getDb();
        // Order by executionTime descending to show most recent first
        return db.all('SELECT * FROM execution_history ORDER BY executionTime DESC');
    }
}
