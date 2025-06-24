import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Tag, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea, Select, RadioGroup, Stack, Radio, useDisclosure, useToast } from '@chakra-ui/react';
import { FaPlus, FaCalendarCheck, FaHistory, FaEdit, FaTrash, FaPlay } from 'react-icons/fa';
import { createScheduledTask, getScheduledTasks, updateScheduledTask, deleteScheduledTask, runScheduledTaskNow, getExecutionHistory } from '../api/schedulerApi';

const ScheduledTasks = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentEditingTask, setCurrentEditingTask] = useState(null);

  // Form state
  const [taskId, setTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [parametersJson, setParametersJson] = useState('');
  const [scheduleType, setScheduleType] = useState('once');
  const [runAtDatetime, setRunAtDatetime] = useState('');
  const [dailyTime, setDailyTime] = useState('09:00');
  const [weeklyDay, setWeeklyDay] = useState('1'); // Monday
  const [weeklyTime, setWeeklyTime] = useState('09:00');
  const [cronExpression, setCronExpression] = useState('');

  const fetchTasksAndHistory = async () => {
    try {
      const tasks = await getScheduledTasks();
      setScheduledTasks(tasks);
      const history = await getExecutionHistory();
      setExecutionHistory(history);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to fetch scheduled tasks or history.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTasksAndHistory();
    // Set default for 'once' to 1 hour from now when component mounts
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setRunAtDatetime(now.toISOString().slice(0, 16));
  }, []);

  const openCreateModal = () => {
    setCurrentEditingTask(null);
    // Reset form fields
    setTaskId('');
    setTaskName('');
    setApiEndpoint('');
    setParametersJson('');
    setScheduleType('once');
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setRunAtDatetime(now.toISOString().slice(0, 16));
    setDailyTime('09:00');
    setWeeklyDay('1');
    setWeeklyTime('09:00');
    setCronExpression('');
    onOpen();
  };

  const openEditModal = (task) => {
    setCurrentEditingTask(task);
    setTaskId(task.id);
    setTaskName(task.name);
    setApiEndpoint(task.endpoint);
    setParametersJson(JSON.stringify(task.parameters, null, 2));
    setScheduleType(task.schedule.type);

    if (task.schedule.type === 'once') {
      setRunAtDatetime(task.schedule.value);
    } else if (task.schedule.type === 'daily') {
      setDailyTime(task.schedule.value);
    } else if (task.schedule.type === 'weekly') {
      setWeeklyDay(task.schedule.day);
      setWeeklyTime(task.schedule.time);
    } else if (task.schedule.type === 'custom') {
      setCronExpression(task.schedule.value);
    }
    onOpen();
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();

    let parameters = {};
    try {
      parameters = JSON.parse(parametersJson || '{}');
    } catch (e) {
      toast({
        title: 'Invalid JSON',
        description: 'Parameters must be a valid JSON object.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let schedule = { type: scheduleType };
    if (scheduleType === 'once') {
      schedule.value = runAtDatetime;
    } else if (scheduleType === 'daily') {
      schedule.value = dailyTime;
    } else if (scheduleType === 'weekly') {
      schedule.day = weeklyDay;
      schedule.time = weeklyTime;
    } else if (scheduleType === 'custom') {
      schedule.value = cronExpression;
    }

    const taskData = {
      name: taskName,
      endpoint: apiEndpoint,
      parameters: parameters,
      schedule: schedule,
    };

    try {
      if (currentEditingTask) {
        await updateScheduledTask(taskId, taskData);
        toast({
          title: 'Task Updated',
          description: 'Scheduled task updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createScheduledTask(taskData);
        toast({
          title: 'Task Created',
          description: 'New scheduled task created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      fetchTasksAndHistory(); // Refresh data
      onClose();
    } catch (error) {
      toast({
        title: 'Error Saving Task',
        description: error.message || 'Failed to save scheduled task.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled task?')) {
      try {
        await deleteScheduledTask(id);
        toast({
          title: 'Task Deleted',
          description: 'Scheduled task deleted successfully.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        fetchTasksAndHistory(); // Refresh data
      } catch (error) {
        toast({
          title: 'Error Deleting Task',
          description: error.message || 'Failed to delete scheduled task.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleRunNow = async (id) => {
    try {
      await runScheduledTaskNow(id);
      toast({
        title: 'Task Executed',
        description: 'Scheduled task executed manually.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchTasksAndHistory(); // Refresh data
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute task manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderScheduleDetails = () => {
    switch (scheduleType) {
      case 'once':
        return (
          <Box border="1px dashed" borderColor="border.color" p={4} borderRadius="md" bg="bg.secondary">
            <FormControl id="run-at-datetime" isRequired>
              <FormLabel>Run At (Date & Time)</FormLabel>
              <Input
                type="datetime-local"
                value={runAtDatetime}
                onChange={(e) => setRunAtDatetime(e.target.value)}
                bg="bg.secondary"
                borderColor="border.color"
                color="text.primary"
                _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
              />
            </FormControl>
          </Box>
        );
      case 'daily':
        return (
          <Box border="1px dashed" borderColor="border.color" p={4} borderRadius="md" bg="bg.secondary">
            <FormControl id="daily-time" isRequired>
              <FormLabel>Run Every Day At (Time)</FormLabel>
              <Input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                bg="bg.secondary"
                borderColor="border.color"
                color="text.primary"
                _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
              />
            </FormControl>
          </Box>
        );
      case 'weekly':
        return (
          <Box border="1px dashed" borderColor="border.color" p={4} borderRadius="md" bg="bg.secondary">
            <FormControl id="weekly-day" isRequired mb={4}>
              <FormLabel>Run Every Week On</FormLabel>
              <Select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                bg="bg.secondary"
                borderColor="border.color"
                color="text.primary"
                _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="0">Sunday</option>
              </Select>
            </FormControl>
            <FormControl id="weekly-time" isRequired>
              <FormLabel>Run At (Time)</FormLabel>
              <Input
                type="time"
                value={weeklyTime}
                onChange={(e) => setWeeklyTime(e.target.value)}
                bg="bg.secondary"
                borderColor="border.color"
                color="text.primary"
                _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
              />
            </FormControl>
          </Box>
        );
      case 'custom':
        return (
          <Box border="1px dashed" borderColor="border.color" p={4} borderRadius="md" bg="bg.secondary">
            <FormControl id="cron-expression" isRequired>
              <FormLabel>Cron Expression</FormLabel>
              <Input
                type="text"
                placeholder="e.g., 0 9 * * *" // 9:00 AM daily
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                bg="bg.secondary"
                borderColor="border.color"
                color="text.primary"
                _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
              />
              <Text fontSize="sm" color="text.secondary" mt={1}>e.g., "0 9 * * *" for 9:00 AM daily.</Text>
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box p={8} maxWidth="1400px" mx="auto" width="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="text.primary" letterSpacing="0.05em">
        Scheduled Tasks
      </Heading>

      <Box bg="bg.card" border="1px solid" borderColor="border.color" borderRadius="lg" p={6} boxShadow="lg" mb={8}>
        <Flex align="center" mb={4} color="accent.blue" fontSize="xl" fontWeight="semibold" borderBottom="1px solid" borderColor="border.color" pb={4}>
          <Box as={FaCalendarCheck} mr={3} />
          Manage Scheduled API Calls
        </Flex>

        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={openCreateModal} mb={6}>
          Create New Schedule
        </Button>

        <Box overflowX="auto">
          <Table variant="simple" className="task-table">
            <Thead>
              <Tr>
                <Th color="text.secondary">Task Name</Th>
                <Th color="text.secondary">Endpoint</Th>
                <Th color="text.secondary">Parameters</Th>
                <Th color="text.secondary">Schedule</Th>
                <Th color="text.secondary">Last Run</Th>
                <Th color="text.secondary">Next Run</Th>
                <Th color="text.secondary">Status</Th>
                <Th color="text.secondary">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scheduledTasks.length === 0 ? (
                <Tr><Td colSpan={8} textAlign="center" color="text.secondary" py={8}>No scheduled tasks found.</Td></Tr>
              ) : (
                scheduledTasks.map((task) => (
                  <Tr key={task.id}>
                    <Td>{task.name}</Td>
                    <Td>{task.endpoint}</Td>
                    <Td fontSize="sm" fontFamily="IBM Plex Mono"><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '100px', overflowY: 'auto' }}>{JSON.stringify(task.parameters, null, 2)}</pre></Td>
                    <Td>{task.schedule.type === 'once' ? task.schedule.value : task.schedule.type === 'custom' ? task.schedule.value : `${task.schedule.type} at ${task.schedule.time || task.schedule.value}`}</Td>
                    <Td>{task.lastRun === 'N/A' ? 'N/A' : new Date(task.lastRun).toLocaleString()}</Td>
                    <Td>{task.nextRun === 'N/A' || task.nextRun === 'Completed' ? task.nextRun : new Date(task.nextRun).toLocaleString()}</Td>
                    <Td>
                      <Tag size="md" variant="subtle" colorScheme={getStatusColor(task.status)} borderRadius="full">
                        <Box as="span" className="dot" bg={`${getStatusColor(task.status)}.500`} borderRadius="full" w="2" h="2" mr="2"></Box>
                        {task.status}
                      </Tag>
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <IconButton
                          icon={<FaPlay />}
                          colorScheme="green"
                          size="sm"
                          onClick={() => handleRunNow(task.id)}
                          aria-label="Run Now"
                          title="Run Now"
                        />
                        <IconButton
                          icon={<FaEdit />}
                          colorScheme="teal"
                          size="sm"
                          onClick={() => openEditModal(task)}
                          aria-label="Edit Task"
                          title="Edit Task"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete Task"
                          title="Delete Task"
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Box bg="bg.card" border="1px solid" borderColor="border.color" borderRadius="lg" p={6} boxShadow="lg">
        <Flex align="center" mb={4} color="accent.blue" fontSize="xl" fontWeight="semibold" borderBottom="1px solid" borderColor="border.color" pb={4}>
          <Box as={FaHistory} mr={3} />
          Execution History
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple" className="task-table">
            <Thead>
              <Tr>
                <Th color="text.secondary">Task Name</Th>
                <Th color="text.secondary">Execution Time</Th>
                <Th color="text.secondary">Status</Th>
                <Th color="text.secondary">Output/Error</Th>
              </Tr>
            </Thead>
            <Tbody>
              {executionHistory.length === 0 ? (
                <Tr><Td colSpan={4} textAlign="center" color="text.secondary" py={8}>No execution history.</Td></Tr>
              ) : (
                executionHistory.map((historyItem, index) => (
                  <Tr key={index}>
                    <Td>{historyItem.taskName}</Td>
                    <Td>{new Date(historyItem.executionTime).toLocaleString()}</Td>
                    <Td>
                      <Tag size="md" variant="subtle" colorScheme={getStatusColor(historyItem.status)} borderRadius="full">
                        <Box as="span" className="dot" bg={`${getStatusColor(historyItem.status)}.500`} borderRadius="full" w="2" h="2" mr="2"></Box>
                        {historyItem.status}
                      </Tag>
                    </Td>
                    <Td fontSize="sm" fontFamily="IBM Plex Mono"><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '100px', overflowY: 'auto' }}>{historyItem.output}</pre></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Schedule Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="bg.card" borderRadius="lg" boxShadow="2xl" p={6} maxH="90vh" overflowY="auto">
          <ModalHeader color="text.primary" borderBottom="1px solid" borderColor="border.color" pb={4} mb={4}>
            {currentEditingTask ? 'Edit Scheduled Task' : 'Create New Scheduled Task'}
          </ModalHeader>
          <ModalCloseButton color="text.secondary" _hover={{ color: 'text.primary' }} />
          <ModalBody>
            <form id="schedule-form" onSubmit={handleSaveTask}>
              <Input type="hidden" value={taskId} />

              <FormControl id="task-name" isRequired mb={4}>
                <FormLabel color="text.primary">Task Name</FormLabel>
                <Input
                  type="text"
                  placeholder="e.g., Daily Backend Restart"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  bg="bg.secondary"
                  borderColor="border.color"
                  color="text.primary"
                  _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
                />
              </FormControl>

              <FormControl id="api-endpoint" isRequired mb={4}>
                <FormLabel color="text.primary">API Endpoint</FormLabel>
                <Select
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  bg="bg.secondary"
                  borderColor="border.color"
                  color="text.primary"
                  _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
                >
                  <option value="">Select an endpoint</option>
                  <option value="/execute_codebase:post">POST /execute_codebase (Process Startup Sh)</option>
                  <option value="/code_server:post">POST /code_server (Start Codeserver)</option>
                  <option value="/rollback_server:post">POST /rollback_server (Rollback Server)</option>
                  <option value="/logs/{dir_name}:get">GET /logs/{dir_name} (Get Container Logs)</option>
                  <option value="/containers:get">GET /containers (List Docker Containers)</option>
                  <option value="/stop_process:post">POST /stop_process (Stop Process)</option>
                  <option value="/upload_image:post">POST /upload_image (Upload Image)</option>
                </Select>
              </FormControl>

              <FormControl id="parameters-json" mb={4}>
                <FormLabel color="text.primary">Parameters (JSON) <Text as="span" color="text.secondary" fontSize="sm">(Simulated input)</Text></FormLabel>
                <Textarea
                  placeholder='{"dir_name": "my-project"}'
                  value={parametersJson}
                  onChange={(e) => setParametersJson(e.target.value)}
                  bg="bg.secondary"
                  borderColor="border.color"
                  color="text.primary"
                  _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
                  minH="80px"
                  resize="vertical"
                />
                <Text fontSize="sm" color="text.secondary" mt={1}>Enter parameters as a JSON object. For /upload_image, you'd specify a file path (simulated).</Text>
              </FormControl>

              <FormControl as="fieldset" isRequired mb={4}>
                <FormLabel as="legend" color="text.primary">Schedule Type</FormLabel>
                <RadioGroup onChange={setScheduleType} value={scheduleType}>
                  <Stack direction={{ base: 'column', md: 'row' }} wrap="wrap" spacing={4}>
                    <Flex as="label" className="radio-group" alignItems="center" bg="bg.secondary" p={3} borderRadius="md" border="1px solid" borderColor="border.color" cursor="pointer" _hover={{ bg: 'bg.card', borderColor: 'accent.blue' }}>
                      <Radio value="once" mr={2} />
                      <Text color="text.secondary">Once</Text>
                    </Flex>
                    <Flex as="label" className="radio-group" alignItems="center" bg="bg.secondary" p={3} borderRadius="md" border="1px solid" borderColor="border.color" cursor="pointer" _hover={{ bg: 'bg.card', borderColor: 'accent.blue' }}>
                      <Radio value="daily" mr={2} />
                      <Text color="text.secondary">Daily</Text>
                    </Flex>
                    <Flex as="label" className="radio-group" alignItems="center" bg="bg.secondary" p={3} borderRadius="md" border="1px solid" borderColor="border.color" cursor="pointer" _hover={{ bg: 'bg.card', borderColor: 'accent.blue' }}>
                      <Radio value="weekly" mr={2} />
                      <Text color="text.secondary">Weekly</Text>
                    </Flex>
                    <Flex as="label" className="radio-group" alignItems="center" bg="bg.secondary" p={3} borderRadius="md" border="1px solid" borderColor="border.color" cursor="pointer" _hover={{ bg: 'bg.card', borderColor: 'accent.blue' }}>
                      <Radio value="custom" mr={2} />
                      <Text color="text.secondary">Custom (Cron)</Text>
                    </Flex>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {renderScheduleDetails()}
            </form>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="border.color" pt={4} mt={4}>
            <Button variant="ghost" onClick={onClose} mr={3} color="text.secondary" _hover={{ bg: 'bg.card', color: 'text.primary' }}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveTask}>
              Save Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ScheduledTasks;