// scheduler-backend/utils/cronScheduler.js

import cron from 'node-cron';
import axios from 'axios';
import { Task } from '../models/Task.js'; // Import the Task model to interact with the database

// Base URL for the external Codehub Execution Engine API
const CODEHUB_API_BASE_URL = process.env.CODEHUB_API_BASE_URL || "http://34.28.45.117:8000";

// A map to store active cron jobs, keyed by task ID
const scheduledJobs = {};

/**
 * Helper function to parse parameters based on the endpoint.
 * Handles path parameters for GET requests and form data for POST requests.
 *
 * @param {string} endpoint The API endpoint path (e.g., "/logs/{dir_name}")
 * @param {object} params The parameters object from the task
 * @returns {object} { url: string, data: object | FormData | null, headers: object }
 */
function prepareRequest(endpoint, params) {
    let url = `${CODEHUB_API_BASE_URL}${endpoint}`;
    let data = null;
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded' // Default for most POSTs
    };

    // Handle path parameters for GET requests like /logs/{dir_name}
    if (endpoint.includes('{') && endpoint.includes('}')) {
        const pathParamName = endpoint.substring(endpoint.indexOf('{') + 1, endpoint.indexOf('}'));
        if (params && params[pathParamName]) {
            url = url.replace(`{${pathParamName}}`, params[pathParamName]);
        } else {
            console.warn(`Missing path parameter '${pathParamName}' for endpoint '${endpoint}'`);
            url = url.replace(`{${pathParamName}}`, 'default'); // Fallback
        }
    }

    // For POST requests, parameters go in the body
    const method = getHttpMethod(endpoint);
    if (method === 'post') {
        // Special handling for /upload_image
        if (endpoint === '/upload_image') {
            // The Codehub API's uploadImage expects a 'file' object with 'name', 'size', 'type'.
            // Since we're in Node.js and not dealing with actual files from a browser input,
            // we'll simulate this object.
            const fileName = params && params.file ? params.file : 'simulated_upload.txt';
            const fileSize = 1024 * 1024; // 1 MB simulated size
            const fileType = 'text/plain';

            data = {
                name: fileName,
                size: fileSize,
                type: fileType,
                // Add any other relevant properties that the simulated Codehub API might check
            };
            headers['Content-Type'] = 'application/json'; // Send as JSON for the simulated API to parse
        } else {
            // For x-www-form-urlencoded, Axios can take a plain object
            // or URLSearchParams. Let's use URLSearchParams for explicit control.
            const urlSearchParams = new URLSearchParams();
            if (params) {
                for (const key in params) {
                    if (Object.prototype.hasOwnProperty.call(params, key)) {
                        urlSearchParams.append(key, params[key]);
                    }
                }
            }
            data = urlSearchParams.toString();
        }
    }

    return { url, data, headers };
}


/**
 * Determines the HTTP method for a given endpoint.
 * @param {string} endpoint The API endpoint path.
 * @returns {string} 'get' or 'post'.
 */
function getHttpMethod(endpoint) {
    // Based on the OpenAPI spec provided:
    // /logs/{dir_name} and /containers are GET
    // All others are POST
    if (endpoint.startsWith('/logs/') || endpoint === '/containers') {
        return 'get';
    }
    return 'post';
}

/**
 * Converts a schedule object into a cron expression.
 * @param {object} schedule The schedule object from the task.
 * @returns {string} A cron expression string.
 */
function formatCronExpression(schedule) {
    switch (schedule.type) {
        case 'once':
            // For 'once', schedule it at the exact datetime.
            // Example: "2024-03-15T14:30" -> "30 14 15 03 *", but we need to ensure it runs only once.
            // node-cron handles this by stopping the job after the first run if configured.
            // The cron expression itself will be for a specific time.
            const date = new Date(schedule.value);
            const minute = date.getMinutes();
            const hour = date.getHours();
            const dayOfMonth = date.getDate();
            const month = date.getMonth() + 1; // Month is 0-indexed
            const dayOfWeek = '*'; // Any day of the week
            return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        case 'daily':
            // Example: "09:00" -> "0 9 * * *"
            const [dailyHour, dailyMinute] = schedule.value.split(':');
            return `${parseInt(dailyMinute)} ${parseInt(dailyHour)} * * *`;
        case 'weekly':
            // Example: { day: "1", time: "10:30" } -> "30 10 * * 1" (1=Monday)
            const [weeklyHour, weeklyMinute] = schedule.time.split(':');
            const day = schedule.day; // 0 for Sunday, 1 for Monday...
            return `${parseInt(weeklyMinute)} ${parseInt(weeklyHour)} * * ${parseInt(day)}`;
        case 'custom':
            return schedule.value; // Use the provided cron expression directly
        default:
            console.error('Unknown schedule type:', schedule.type);
            return null; // Or throw an error
    }
}

/**
 * Calculates the next run time for a scheduled task based on its schedule type for display.
 * This is a simplified calculation and might not perfectly match complex cron behaviors
 * but provides a reasonable estimate for UI display.
 * @param {object} schedule - The schedule object (type, value, day, time).
 * @returns {string} - Formatted string of the next run time, or 'N/A' if not applicable.
 */
const calculateNextRunDisplayString = (schedule) => {
    const now = new Date();
    let nextRunDate = new Date();

    if (schedule.type === 'once') {
        nextRunDate = new Date(schedule.value);
        if (nextRunDate <= now) {
            return 'Completed'; // If a one-time task is in the past, consider it completed for display
        }
    } else if (schedule.type === 'daily') {
        const [hours, minutes] = schedule.value.split(':').map(Number);
        nextRunDate.setHours(hours, minutes, 0, 0);
        if (nextRunDate <= now) {
            nextRunDate.setDate(nextRunDate.getDate() + 1);
        }
    } else if (schedule.type === 'weekly') {
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const targetDay = parseInt(schedule.day); // 0 for Sunday, 1 for Monday...
        nextRunDate.setHours(hours, minutes, 0, 0);
        let daysToAdd = (targetDay - nextRunDate.getDay() + 7) % 7;
        if (daysToAdd === 0 && nextRunDate <= now) {
            daysToAdd = 7; // If today is the day and time has passed, schedule for next week
        } else if (daysToAdd === 0) {
            // If today is the day and time is in future, it's today
        }
        nextRunDate.setDate(nextRunDate.getDate() + daysToAdd);
    } else if (schedule.type === 'custom') {
        // For cron, calculating the *exact* next run without a full cron library is complex.
        // node-cron handles the actual scheduling. For display, we can provide a generic message.
        // If a more precise display is needed, a library like 'cronstrue' or 'cron-parser' would be used here.
        return 'Cron-based (dynamic)';
    } else {
        return 'N/A';
    }

    return nextRunDate.toISOString(); // Return ISO string for consistency with lastRun
};

/**
 * Schedules a single task using node-cron.
 * @param {object} task The task object to schedule.
 */
export const scheduleTask = (task) => {
    // If a job with this ID already exists, cancel it first to avoid duplicates
    if (scheduledJobs[task.id]) {
        cancelTask(task.id);
    }

    const cronExpression = formatCronExpression(task.schedule);
    if (!cronExpression) {
        console.error(`Failed to schedule task ${task.name}: Invalid cron expression.`);
        return;
    }

    console.log(`Scheduling task '${task.name}' (${task.id}) with cron: '${cronExpression}'`);

    const job = cron.schedule(cronExpression, async () => {
        console.log(`Executing scheduled task: ${task.name} (${task.id}) at ${new Date().toLocaleString()}`);

        let executionStatus = 'Completed';
        let executionOutput = '';
        let nextRunForDb = null;

        try {
            const { url, data, headers } = prepareRequest(task.endpoint, task.parameters);
            const method = getHttpMethod(task.endpoint);

            let response;
            if (method === 'post') {
                response = await axios.post(url, data, { headers });
            } else { // GET
                response = await axios.get(url, { params: data, headers }); // GET parameters go in `params`
            }

            executionOutput = JSON.stringify(response.data, null, 2);
            console.log(`Task '${task.name}' executed successfully. Response:`, response.data);
        } catch (error) {
            executionStatus = 'Failed';
            executionOutput = `Error executing task '${task.name}': ${error.message}`;
            if (error.response) {
                executionOutput += `\nResponse Data: ${JSON.stringify(error.response.data, null, 2)}`;
            }
            console.error(executionOutput);
        } finally {
            const now = new Date();
            let updatedStatus = task.status; // Default to current status

            if (task.schedule.type === 'once') {
                // For 'once' tasks, if completed, mark as 'Completed' and stop job
                if (executionStatus === 'Completed') {
                    updatedStatus = 'Completed';
                    job.stop();
                    console.log(`One-time task '${task.name}' (${task.id}) completed and stopped.`);
                    delete scheduledJobs[task.id];
                } else {
                    // If it failed, it might still be active but will not run again if it's 'once'
                    // For simplicity, we keep it as 'Active' unless explicitly 'Completed'
                }
                nextRunForDb = 'N/A'; // No next run for one-time tasks after execution
            } else {
                // For recurring tasks, calculate the next run time after execution
                // and keep status as 'Active' unless it failed critically.
                nextRunForDb = calculateNextRunDisplayString(task.schedule);
                updatedStatus = 'Active'; // Keep active for recurring tasks
            }

            // Update task's lastRun and nextRun in the database
            await Task.update(task.id, {
                lastRun: now.toISOString(), // Store as ISO string for consistency
                nextRun: nextRunForDb, // Update nextRun in DB
                status: updatedStatus,
            });

            // Add to execution history
            await Task.addExecutionHistory({
                taskId: task.id,
                taskName: task.name,
                executionTime: now.toISOString(),
                status: executionStatus,
                output: executionOutput,
            });
        }
    }, {
        scheduled: true, // Start immediately
        timezone: "America/New_York" // Or whatever timezone is appropriate for your server/users
    });

    scheduledJobs[task.id] = job;
};

/**
 * Cancels a scheduled task.
 * @param {string} taskId The ID of the task to cancel.
 */
export const cancelTask = (taskId) => {
    if (scheduledJobs[taskId]) {
        scheduledJobs[taskId].stop();
        delete scheduledJobs[taskId];
        console.log(`Task ${taskId} unscheduled.`);
    }
};

/**
 * Initializes all active tasks from the database and schedules them.
 */
export const initScheduledTasks = async () => {
    try {
        const activeTasks = await Task.getAllActive(); // Assuming a method to get active tasks
        console.log(`Found ${activeTasks.length} active tasks to schedule on startup.`);
        activeTasks.forEach(task => {
            // Re-calculate nextRun on startup based on current time for display accuracy
            // For 'once' tasks, only schedule if it's in the future.
            const taskSchedule = {
                type: task.schedule_type,
                value: task.schedule_value,
                day: task.schedule_day,
                time: task.schedule_time
            };
            const nextRunTime = calculateNextRunDisplayString(taskSchedule);

            if (task.schedule.type !== 'once' || (task.schedule.type === 'once' && nextRunTime !== 'Completed')) {
                scheduleTask({
                    id: task.id,
                    name: task.name,
                    endpoint: task.endpoint,
                    parameters: JSON.parse(task.parameters),
                    schedule: taskSchedule,
                    lastRun: task.lastRun,
                    nextRun: task.nextRun,
                    status: task.status
                });
            } else if (task.schedule.type === 'once' && nextRunTime === 'Completed') {
                // For past one-time tasks, ensure their status is 'Completed' if not already
                if (task.status !== 'Completed' && task.status !== 'Failed') {
                    Task.update(task.id, { status: 'Completed', nextRun: 'N/A' });
                }
            }
        });
    } catch (error) {
        console.error('Error initializing scheduled tasks:', error);
    }
};

// Export the scheduledJobs map for potential debugging or external access if needed
export const getScheduledJobs = () => scheduledJobs;

// Export calculateNextRunDisplayString for use in routes/tasks.js
export { calculateNextRunDisplayString };
