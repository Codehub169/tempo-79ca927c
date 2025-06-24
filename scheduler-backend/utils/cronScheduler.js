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
            // Fallback for missing path param, might result in a 404
            url = url.replace(`{${pathParamName}}`, 'default');
        }
    }

    // For POST requests, parameters go in the body
    const method = getHttpMethod(endpoint);
    if (method === 'post') {
        // Special handling for /upload_image as it expects multipart/form-data
        if (endpoint === '/upload_image') {
            // In a real scenario, 'file' would be a path to a file on the scheduler server,
            // which would then be read and appended to FormData.
            // For this simulation, we'll just send a placeholder string if 'file' exists in params.
            const formData = new FormData();
            if (params && params.file) {
                // This is a simplified simulation. In a real scenario, you'd read the file
                // from the scheduler-backend's filesystem and append its buffer.
                // For now, we'll just send the filename as a Blob or similar, which
                // the Codehub API might handle as a placeholder.
                // A more robust solution would involve streaming or base64 encoding if the file
                // content itself needs to be sent via the scheduler.
                formData.append('file', new Blob([params.file], { type: 'application/octet-stream' }), params.file);
            }
            data = formData;
            headers['Content-Type'] = 'multipart/form-data'; // Axios sets boundary automatically
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
            // Example: "2024-03-15T14:30" -> "30 14 15 03 *" (minute hour day month dayOfWeek)
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
        let nextRun = null;

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
            // Update task's lastRun and potentially nextRun
            await Task.update(task.id, {
                lastRun: now.toISOString(), // Store as ISO string for consistency
                status: task.schedule.type === 'once' && executionStatus === 'Completed' ? 'Completed' : 'Active', // Mark 'once' tasks as completed
            });

            // Add to execution history
            await Task.addExecutionHistory({
                taskId: task.id,
                taskName: task.name,
                executionTime: now.toISOString(),
                status: executionStatus,
                output: executionOutput,
            });

            // If it's a 'once' task, stop the cron job after execution
            if (task.schedule.type === 'once') {
                job.stop();
                console.log(`One-time task '${task.name}' (${task.id}) completed and stopped.`);
                // Remove from scheduledJobs map
                delete scheduledJobs[task.id];
            } else {
                // For recurring tasks, recalculate next run for display purposes (though cron handles it)
                // This is more for UI consistency if needed, actual cron is self-managing
                // The `calculateNextRun` function from frontend `schedulerApi.js` would be needed here
                // to update `nextRun` in the database, but cron itself doesn't need it.
                // For simplicity in this backend, we'll just rely on cron's internal next run logic.
            }
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
            scheduleTask(task);
        });
    } catch (error) {
        console.error('Error initializing scheduled tasks:', error);
    }
};

// Export the scheduledJobs map for potential debugging or external access if needed
export const getScheduledJobs = () => scheduledJobs;
