/**
 * @fileoverview Simulated API client for the local Scheduler Backend.
 * This file mimics API calls to the scheduler backend, returning mock data.
 * In a real application, these would be replaced with actual Axios/fetch calls.
 */

// In a real setup, this would be the actual scheduler backend URL, e.g., '/api/scheduler'
// For this simulation, we're managing state purely client-side.
const API_BASE_URL = 'http://localhost:3001'; // Placeholder for the actual scheduler backend

// Client-side simulated storage
let simulatedScheduledTasks = [];
let simulatedExecutionHistory = [];

// Helper to generate unique IDs
const generateId = () => 'task_' + Math.random().toString(36).substr(2, 9);

/**
 * Simulates a network delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>}
 */
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculates the next run time for a scheduled task based on its schedule type.
 * @param {object} schedule - The schedule object (type, value, day, time).
 * @returns {string} - Formatted string of the next run time.
 */
const calculateNextRun = (schedule) => {
  const now = new Date();
  let nextRunDate = new Date();

  if (schedule.type === 'once') {
    nextRunDate = new Date(schedule.value);
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
    // For cron, this is a placeholder. A real cron library would compute this.
    return 'Cron-based (dynamic)';
  }

  // Ensure recurring tasks are always in the future relative to 'now' if they initially fall in the past
  if (nextRunDate <= now && schedule.type !== 'once') {
    if (schedule.type === 'daily') {
      nextRunDate.setDate(nextRunDate.getDate() + 1);
    } else if (schedule.type === 'weekly') {
      nextRunDate.setDate(nextRunDate.getDate() + 7);
    }
    // If custom (cron) and still in past, a real scheduler would handle next valid run
  }

  return nextRunDate.toLocaleString();
};

/**
 * Simulates fetching all scheduled tasks.
 * Corresponds to GET /tasks
 * @returns {Promise<Array<Object>>}
 */
export const getScheduledTasks = async () => {
  await simulateDelay();
  return [...simulatedScheduledTasks]; // Return a copy
};

/**
 * Simulates creating a new scheduled task.
 * Corresponds to POST /tasks
 * @param {object} taskData - The task data (name, endpoint, parameters, schedule).
 * @returns {Promise<Object>}
 */
export const createScheduledTask = async (taskData) => {
  await simulateDelay();
  const newTask = {
    id: generateId(),
    ...taskData,
    lastRun: 'N/A',
    nextRun: calculateNextRun(taskData.schedule),
    status: 'Active'
  };
  simulatedScheduledTasks.push(newTask);
  return newTask;
};

/**
 * Simulates updating an existing scheduled task.
 * Corresponds to PUT /tasks/{id}
 * @param {string} id - The ID of the task to update.
 * @param {object} taskData - The updated task data.
 * @returns {Promise<Object>}
 */
export const updateScheduledTask = async (id, taskData) => {
  await simulateDelay();
  const index = simulatedScheduledTasks.findIndex(task => task.id === id);
  if (index === -1) {
    throw new Error('Task not found.');
  }
  const updatedTask = {
    ...simulatedScheduledTasks[index],
    ...taskData,
    nextRun: calculateNextRun(taskData.schedule) // Recalculate next run on update
  };
  simulatedScheduledTasks[index] = updatedTask;
  return updatedTask;
};

/**
 * Simulates deleting a scheduled task.
 * Corresponds to DELETE /tasks/{id}
 * @param {string} id - The ID of the task to delete.
 * @returns {Promise<{message: string}>}
 */
export const deleteScheduledTask = async (id) => {
  await simulateDelay();
  const initialLength = simulatedScheduledTasks.length;
  simulatedScheduledTasks = simulatedScheduledTasks.filter(task => task.id !== id);
  if (simulatedScheduledTasks.length === initialLength) {
    throw new Error('Task not found.');
  }
  return { message: 'Task deleted successfully.' };
};

/**
 * Simulates manually running a scheduled task immediately.
 * Corresponds to POST /tasks/{id}/run_now
 * @param {string} id - The ID of the task to run.
 * @returns {Promise<{message: string}>}
 */
export const runScheduledTaskNow = async (id) => {
  await simulateDelay();
  const task = simulatedScheduledTasks.find(t => t.id === id);
  if (!task) {
    throw new Error('Task not found.');
  }

  const now = new Date();
  const executionTime = now.toLocaleString();
  let status = 'Completed';
  let output = `Simulated execution of ${task.endpoint} for task '${task.name}'.\nParameters: ${JSON.stringify(task.parameters, null, 2)}`;

  // Simulate success/failure
  if (Math.random() < 0.15) { // 15% chance of failure
    status = 'Failed';
    output += `\nError: Simulated API call failed. Check parameters.`;
  } else {
    output += `\nAPI Call simulated successfully.`;
  }

  // Update task's lastRun and nextRun (for recurring tasks)
  task.lastRun = executionTime;
  if (task.schedule.type !== 'once') {
    task.nextRun = calculateNextRun(task.schedule);
  } else {
    task.status = 'Completed'; // Mark 'once' tasks as completed
  }

  simulatedExecutionHistory.unshift({ // Add to beginning of history
    taskName: task.name,
    executionTime: executionTime,
    status: status,
    output: output
  });

  return { message: 'Task executed successfully.' };
};

/**
 * Simulates fetching the execution history.
 * Corresponds to GET /history
 * @returns {Promise<Array<Object>>}
 */
export const getExecutionHistory = async () => {
  await simulateDelay();
  return [...simulatedExecutionHistory];
};
