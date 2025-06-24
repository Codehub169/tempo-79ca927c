import axios from 'axios';

const API_BASE_URL = '/api/codehub'; // Proxied via Vite/Node.js backend

/**
 * Processes a startup.sh file.
 * Corresponds to POST /execute_codebase
 * @param {string} dirName - The directory name.
 * @returns {Promise<{message: string, output: string}>}
 */
export const executeCodebase = async (dirName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/execute_codebase`, { dir_name: dirName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to execute codebase.');
  }
};

/**
 * Starts a code server.
 * Corresponds to POST /code_server
 * @param {string} dirName - The directory name.
 * @returns {Promise<{message: string, url: string}>}
 */
export const startCodeServer = async (dirName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/code_server`, { dir_name: dirName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to start code server.');
  }
};

/**
 * Rolls back the server to a specific commit.
 * Corresponds to POST /rollback_server
 * @param {string} dirName - The directory name.
 * @param {string} commitId - The commit ID to rollback to.
 * @returns {Promise<{message: string, status: string}>}
 */
export const rollbackServer = async (dirName, commitId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rollback_server`, { dir_name: dirName, commit_id: commitId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to rollback server.');
  }
};

/**
 * Fetches logs from a Docker container.
 * Corresponds to GET /logs/{dir_name}
 * @param {string} dirName - The directory name (container name).
 * @returns {Promise<{logs: string, dir_name: string}>}
 */
export const getContainerLogs = async (dirName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/${dirName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to get container logs.');
  }
};

/**
 * Lists all Docker containers.
 * Corresponds to GET /containers
 * @returns {Promise<Array<Object>>}
 */
export const listDockerContainers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/containers`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to list Docker containers.');
  }
};

/**
 * Stops a process.
 * Corresponds to POST /stop_process
 * @param {string} dirName - The directory name.
 * @param {boolean} ides - Whether to stop IDEs.
 * @returns {Promise<{message: string, ides_stopped: boolean}>}
 */
export const stopProcess = async (dirName, ides = false) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/stop_process`, { dir_name: dirName, ides });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to stop process.');
  }
};

/**
 * Uploads an image file.
 * Corresponds to POST /upload_image
 * @param {File} file - The file to upload.
 * @returns {Promise<{message: string, file_size: string, file_type: string}>}
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload_image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Failed to upload image.');
  }
};
