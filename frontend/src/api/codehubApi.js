/**
 * @fileoverview Simulated API client for the Codehub Execution Engine.
 * This file mimics API calls to the backend, returning mock data.
 * In a real application, these would be replaced with actual Axios/fetch calls.
 */

const API_BASE_URL = 'http://34.28.45.117:8000';

/**
 * Simulates a network delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>}
 */
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulates an API call response, including potential errors.
 * @param {any} data - The data to return on success.
 * @param {number} status - The HTTP status code.
 * @param {boolean} isError - Whether the response is an error.
 * @returns {Promise<any>}
 */
const simulateApiResponse = async (data, status = 200, isError = false) => {
  await simulateDelay();
  if (isError) {
    const errorDetail = data?.detail?.[0]?.msg || 'An unknown error occurred.';
    throw new Error(`API Error ${status}: ${errorDetail}`);
  } else {
    return data;
  }
};

/**
 * Simulates processing a startup.sh file.
 * Corresponds to POST /execute_codebase
 * @param {string} dirName - The directory name.
 * @returns {Promise<{message: string, output: string}>}
 */
export const executeCodebase = async (dirName) => {
  const isError = Math.random() < 0.1; // 10% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["dir_name"], msg: "Simulated failure to process startup.sh", type: "value_error" }] },
      422,
      true
    );
  }
  return simulateApiResponse({
    message: `Successfully processed startup.sh for directory: ${dirName}`,
    output: `Container '${dirName}' started on port 8000. Logs available via /logs/${dirName}`
  });
};

/**
 * Simulates starting a code server.
 * Corresponds to POST /code_server
 * @param {string} dirName - The directory name.
 * @returns {Promise<{message: string, url: string}>}
 */
export const startCodeServer = async (dirName) => {
  const isError = Math.random() < 0.1; // 10% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["dir_name"], msg: "Failed to start code server due to resource limits", type: "server_error" }] },
      500,
      true
    );
  }
  return simulateApiResponse({
    message: `Code server started for directory: ${dirName}`,
    url: `http://localhost:8080/code/${dirName}`
  });
};

/**
 * Simulates rolling back the server to a specific commit.
 * Corresponds to POST /rollback_server
 * @param {string} dirName - The directory name.
 * @param {string} commitId - The commit ID to rollback to.
 * @returns {Promise<{message: string, status: string}>}
 */
export const rollbackServer = async (dirName, commitId) => {
  const isError = Math.random() < 0.1; // 10% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["commit_id"], msg: "Invalid commit ID or repository not found", type: "validation_error" }] },
      422,
      true
    );
  }
  return simulateApiResponse({
    message: `Repository rolled back to commit ${commitId} for directory: ${dirName}`,
    status: "Server restarted successfully."
  });
};

/**
 * Simulates fetching logs from a Docker container.
 * Corresponds to GET /logs/{dir_name}
 * @param {string} dirName - The directory name (container name).
 * @returns {Promise<{logs: string, dir_name: string}>}
 */
export const getContainerLogs = async (dirName) => {
  const isError = Math.random() < 0.05; // 5% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["path", "dir_name"], msg: "Container not found or logs unavailable", type: "not_found" }] },
      404,
      true
    );
  }
  const logs = `[INFO] ${new Date().toISOString()} - Container '${dirName}' started.\n` +
               `[INFO] ${new Date().toISOString()} - Initializing application...\n` +
               `[SUCCESS] ${new Date().toISOString()} - Application running on port 8000.\n` +
               `[DEBUG] ${new Date().toISOString()} - Debugging info: process ID 12345.\n` +
               `[WARN] ${new Date().toISOString()} - High memory usage detected, consider optimization.\n` +
               `[INFO] ${new Date().toISOString()} - API endpoint /health checked, status OK.`;
  return simulateApiResponse({ logs, dir_name: dirName });
};

/**
 * Simulates listing all Docker containers.
 * Corresponds to GET /containers
 * @returns {Promise<Array<Object>>}
 */
export const listDockerContainers = async () => {
  const isError = Math.random() < 0.02; // 2% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: [], msg: "Failed to connect to Docker daemon", type: "server_error" }] },
      500,
      true
    );
  }
  const containers = [
    { id: 'a1b2c3d4e5f6', name: 'project-alpha', status: 'running', ports: '8000/tcp', image: 'ubuntu/custom', created: '2 days ago' },
    { id: 'f6e5d4c3b2a1', name: 'dev-backend', status: 'running', ports: '9000/tcp', image: 'python/app', created: '1 week ago' },
    { id: '1a2b3c4d5e6f', name: 'staging-api', status: 'exited', ports: '', image: 'node/express', created: '3 days ago' },
    { id: 'b2a1c3d4e5f6', name: 'data-processor', status: 'stopped', ports: '', image: 'java/spark', created: '5 days ago' },
    { id: 'c3d4e5f6a1b2', name: 'frontend-dev', status: 'running', ports: '3000/tcp', image: 'react/app', created: '1 day ago' },
    { id: 'd4e5f6a1b2c3', name: 'ml-inference', status: 'pending', ports: '', image: 'tensorflow/gpu', created: '1 hour ago' },
    { id: 'e5f6a1b2c3d4', name: 'legacy-service', status: 'exited', ports: '5000/tcp', created: '2 weeks ago' },
    { id: 'f6a1b2c3d4e5', name: 'test-runner', status: 'running', ports: '4000/tcp', image: 'golang/test', created: '6 hours ago' },
  ];
  return simulateApiResponse(containers);
};

/**
 * Simulates stopping a process.
 * Corresponds to POST /stop_process
 * @param {string} dirName - The directory name.
 * @param {boolean} ides - Whether to stop IDEs.
 * @returns {Promise<{message: string, ides_stopped: boolean}>}
 */
export const stopProcess = async (dirName, ides = false) => {
  const isError = Math.random() < 0.1; // 10% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["dir_name"], msg: "Process not found or already stopped", type: "not_found" }] },
      404,
      true
    );
  }
  return simulateApiResponse({
    message: `Process for directory: ${dirName} stopped successfully.`,
    ides_stopped: ides
  });
};

/**
 * Simulates uploading an image file.
 * Corresponds to POST /upload_image
 * @param {File} file - The file to upload.
 * @returns {Promise<{message: string, file_size: string, file_type: string}>}
 */
export const uploadImage = async (file) => {
  const isError = Math.random() < 0.15; // 15% chance of error
  if (isError) {
    return simulateApiResponse(
      { detail: [{ loc: ["file"], msg: "File upload failed due to size or type", type: "upload_error" }] },
      400,
      true
    );
  }
  return simulateApiResponse({
    message: `File '${file.name}' uploaded successfully.`,
    file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    file_type: file.type
  });
};
