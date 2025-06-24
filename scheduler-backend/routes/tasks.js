// scheduler-backend/routes/tasks.js
import express from 'express';
import { Task } from '../models/Task.js';
import { scheduleTask, cancelTask, calculateNextRunDisplayString } from '../utils/cronScheduler.js';

const router = express.Router();

// GET all scheduled tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.getAll();
        // For display, parse parameters back to JSON objects
        const tasksForResponse = tasks.map(task => ({
            ...task,
            parameters: JSON.parse(task.parameters),
            schedule: {
                type: task.schedule_type,
                value: task.schedule_value,
                day: task.schedule_day,
                time: task.schedule_time
            },
            // Recalculate nextRun for display, especially after server restarts
            // The value in DB might be 'Pending Calculation' or stale
            nextRun: calculateNextRunDisplayString({
                type: task.schedule_type,
                value: task.schedule_value,
                day: task.schedule_day,
                time: task.schedule_time
            })
        }));
        res.json(tasksForResponse);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
});

// POST a new scheduled task
router.post('/', async (req, res) => {
    try {
        const { name, endpoint, parameters, schedule } = req.body;

        // Basic validation
        if (!name || !endpoint || !schedule || !schedule.type) {
            return res.status(400).json({ message: 'Missing required task fields.' });
        }

        const newTask = await Task.create({ name, endpoint, parameters, schedule });
        scheduleTask(newTask); // Schedule the task immediately after creation

        res.status(201).json({
            message: 'Task created and scheduled successfully',
            task: {
                ...newTask,
                parameters: JSON.parse(newTask.parameters), // Ensure parameters are parsed for response
                schedule: {
                    type: newTask.schedule_type,
                    value: newTask.schedule_value,
                    day: newTask.schedule_day,
                    time: newTask.schedule_time
                }
            }
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
});

// PUT (update) an existing scheduled task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, endpoint, parameters, schedule } = req.body;

        // Fetch existing task to merge updates
        const existingTask = await Task.getById(id);
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Construct updated task data
        const updatedData = {
            name: name || existingTask.name,
            endpoint: endpoint || existingTask.endpoint,
            parameters: parameters !== undefined ? parameters : JSON.parse(existingTask.parameters),
            schedule: schedule || {
                type: existingTask.schedule_type,
                value: existingTask.schedule_value,
                day: existingTask.schedule_day,
                time: existingTask.schedule_time
            }
        };

        const updatedTask = await Task.update(id, updatedData);
        cancelTask(id); // Cancel old job
        scheduleTask({ // Schedule new job with updated details
            id: updatedTask.id,
            name: updatedTask.name,
            endpoint: updatedTask.endpoint,
            parameters: JSON.parse(updatedTask.parameters),
            schedule: {
                type: updatedTask.schedule_type,
                value: updatedTask.schedule_value,
                day: updatedTask.schedule_day,
                time: updatedTask.schedule_time
            }
        });

        res.json({
            message: 'Task updated successfully',
            task: {
                ...updatedTask,
                parameters: JSON.parse(updatedTask.parameters),
                schedule: {
                    type: updatedTask.schedule_type,
                    value: updatedTask.schedule_value,
                    day: updatedTask.schedule_day,
                    time: updatedTask.schedule_time
                }
            }
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
});

// DELETE a scheduled task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Task.delete(id);
        cancelTask(id); // Cancel the cron job

        res.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
});

// POST to run a scheduled task immediately
router.post('/:id/run_now', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.getById(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        let executionStatus = 'Completed';
        let executionOutput = '';

        try {
            executionOutput = `Simulated manual execution of ${task.endpoint} for task '${task.name}'.`;
            console.log(`Manually executing task: ${task.name} (${task.id})`);

        } catch (error) {
            executionStatus = 'Failed';
            executionOutput = `Error during manual execution of task '${task.name}': ${error.message}`;
            if (error.response) {
                executionOutput += `\nResponse Data: ${JSON.stringify(error.response.data, null, 2)}`;
            }
            console.error(executionOutput);
        } finally {
            const now = new Date();
            await Task.update(id, {
                lastRun: now.toISOString(),
                status: executionStatus === 'Completed' ? 'Active' : 'Failed' // Keep active for recurring, mark failed for others
            });
            await Task.addExecutionHistory({
                taskId: id,
                taskName: task.name,
                executionTime: now.toISOString(),
                status: executionStatus,
                output: executionOutput
            });
        }

        res.json({ message: 'Task execution initiated successfully.' });
    } catch (error) {
        console.error('Error running task now:', error);
        res.status(500).json({ message: 'Failed to run task immediately', error: error.message });
    }
});

// GET execution history
router.get('/history', async (req, res) => {
    try {
        const history = await Task.getExecutionHistory();
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Failed to fetch execution history', error: error.message });
    }
});

export default router;
