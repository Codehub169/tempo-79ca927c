/**
 * @fileoverview Simulated API client for the local Scheduler Backend.
 * This file mimics API calls to the scheduler backend, returning mock data.
 * In a real application, these would be replaced with actual Axios/fetch calls.
 */

// In a real setup, this would be the actual scheduler backend URL, e.g., '/api/scheduler'
// For this simulation, we're managing state purely client-side.
const API_BASE_URL = '/api/scheduler'; // Use relative path to proxy through Vite dev server/Node.js backend

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
 * Simulates fetching all scheduled tasks.
 * Corresponds to GET /tasks
 * @returns {Promise<Array<Object>>}
 */
export const getScheduledTasks = async () => {
  await simulateDelay();
  // In a real scenario, this would be an actual fetch/axios call to the backend:
  // const response = await axios.get(`${API_BASE_URL}/tasks`);
  // return response.data;
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
  // In a real scenario:
  // const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
  // return response.data;
  const newTask = {
    id: generateId(),
    ...taskData,
    lastRun: 'N/A',
    nextRun: 'Pending Calculation',
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
  // In a real scenario:
  // const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData);
  // return response.data;
  const index = simulatedScheduledTasks.findIndex(task => task.id === id);
  if (index === -1) {
    throw new Error('Task not found.');
  }
  const updatedTask = {
    ...simulatedScheduledTasks[index],
    ...taskData,
    nextRun: 'Pending Recalculation' // Backend will provide the actual nextRun
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
  // In a real scenario:
  // const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
  // return response.data;
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
  // In a real scenario:
  // const response = await axios.post(`${API_BASE_URL}/tasks/${id}/run_now`);
  // return response.data;
  const task = simulatedScheduledTasks.find(t => t.id === id);
  if (!task) {
    throw new Error('Task not found.');
  }

  const now = new Date();
  const executionTime = now.toISOString();
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
  if (task.schedule.type === 'once') {
    task.status = 'Completed'; // Mark 'once' tasks as completed
  } else {
    task.nextRun = 'Pending Recalculation'; // Backend will update the actual nextRun
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
  // In a real scenario:
  // const response = await axios.get(`${API_BASE_URL}/history`);
  // return response.data;
  return [...simulatedExecutionHistory];
};