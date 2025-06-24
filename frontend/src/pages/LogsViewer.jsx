import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Flex, Input, Button, Text, VStack, IconButton, useToast, Spinner } from '@chakra-ui/react';
import { FaPlay, FaStop, FaPause, FaSearch, FaEraser, FaRedo } from 'react-icons/fa';
import { getContainerLogs } from '../api/codehubApi';

const LogsViewer = () => {
  const toast = useToast();
  const logViewerRef = useRef(null);

  const [dirName, setDirName] = useState('');
  const [isTailing, setIsTailing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logBuffer, setLogBuffer] = useState([]); // Stores all logs for search/filter
  const [isLoading, setIsLoading] = useState(false);

  let tailingInterval = useRef(null);

  // Simulate log generation
  const generateLog = (currentDirName) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
    const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS'];
    const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];

    const messages = [
      `Container '${currentDirName}' processing request...`,
      `[API] GET /status - 200 OK`,
      `[DB] Query executed successfully: SELECT * FROM users;`,
      `[NETWORK] Connection established to external service.`,
      `[FILE] Writing data to /var/log/app.log`,
      `Application heartbeat detected.`,
      `Worker thread #3 completed task.`,
      `[ERROR] Failed to connect to database on retry #5.`,
      `[WARN] High CPU usage detected, scaling up.`,
      `[SUCCESS] Operation completed in 120ms.`,
      `User 'admin' logged in from 192.168.1.100.`,
      `Memory usage: 75% of allocated.`,
      `[DEBUG] Variable 'x' has value: 123`,
      `Queue size: 5 messages.`,
      `Scheduled task 'cleanup' started.`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return { timestamp, level: randomType, message: randomMessage };
  };

  const appendLog = (logEntry) => {
    setLogBuffer(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    // Auto-scroll when new logs are added, unless paused
    if (!isPaused && logViewerRef.current) {
      logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
    }
  }, [logBuffer, isPaused]); // Depend on logBuffer and isPaused

  const startTailing = async () => {
    if (!dirName) {
      toast({
        title: 'Input Required',
        description: 'Please enter a directory name.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setLogBuffer([]); // Clear previous logs
    setIsTailing(true);
    setIsPaused(false); // Ensure not paused on start
    setSearchTerm(''); // Clear search on new tail
    dirNameInputRef.current.disabled = true; // Disable input while tailing

    try {
      const response = await getContainerLogs(dirName); // Simulated API call
      // Add initial logs from simulated API response
      response.logs.split('\n').forEach(logLine => {
        if (logLine.trim()) {
          // Parse simulated log line (e.g., [INFO] 2023-10-27T10:00:00.000Z - Message)
          const match = logLine.match(/\[(INFO|WARN|ERROR|DEBUG|SUCCESS)\] (.*?) - (.*)/);
          if (match) {
            appendLog({ timestamp: match[2], level: match[1], message: match[3] });
          } else {
            appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: logLine });
          }
        }
      });

      toast({
        title: 'Tailing Started',
        description: `Successfully started tailing logs for '${dirName}'.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Simulate continuous log streaming
      tailingInterval.current = setInterval(() => {
        appendLog(generateLog(dirName));
      }, 500); // New log every 500ms

    } catch (error) {
      toast({
        title: 'Error Tailing Logs',
        description: error.message || 'Failed to fetch logs.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      stopTailing(); // Stop if initial fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const stopTailing = () => {
    clearInterval(tailingInterval.current);
    tailingInterval.current = null;
    setIsTailing(false);
    setIsPaused(false); // Reset pause state
    dirNameInputRef.current.disabled = false; // Enable input
    toast({
      title: 'Tailing Stopped',
      description: 'Log tailing has been stopped.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const togglePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  const clearLogs = () => {
    stopTailing(); // Stop tailing if active
    setLogBuffer([]);
    setSearchTerm('');
    toast({
      title: 'Logs Cleared',
      description: 'The log viewer has been cleared.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Effect to handle URL parameter for dir_name on initial load
  const dirNameInputRef = useRef(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialDirName = urlParams.get('dir_name');
    if (initialDirName) {
      setDirName(initialDirName);
      // Use a timeout to ensure state update propagates before starting tailing
      setTimeout(() => {
        startTailing();
      }, 100); 
    }

    return () => {
      clearInterval(tailingInterval.current);
    };
  }, []);

  const filteredLogs = logBuffer.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={8} maxWidth="1400px" mx="auto" width="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="text.primary" letterSpacing="0.05em">
        Container Logs Viewer
      </Heading>

      <Box bg="bg.card" border="1px solid" borderColor="border.primary" borderRadius="lg" p={6} boxShadow="lg">
        <Flex align="center" mb={4} color="accent.blue" fontSize="xl" fontWeight="semibold" borderBottom="1px solid" borderColor="border.primary" pb={4}>
          <Box as={FaRedo} mr={3} />
          Real-time Logs
        </Flex>

        <Flex wrap="wrap" gap={4} mb={6} align="center">
          <Input
            ref={dirNameInputRef}
            placeholder="Enter directory name (e.g., project-alpha)"
            value={dirName}
            onChange={(e) => setDirName(e.target.value)}
            flex="1"
            minWidth={{ base: '100%', md: '200px' }}
            bg="bg.secondary"
            borderColor="border.primary"
            color="text.primary"
            _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
          />
          <Button
            leftIcon={<FaPlay />}
            colorScheme="blue"
            onClick={startTailing}
            isLoading={isLoading}
            isDisabled={isTailing}
            minWidth="150px"
          >
            Start Tailing
          </Button>
          <Button
            leftIcon={<FaStop />}
            colorScheme="red"
            onClick={stopTailing}
            isDisabled={!isTailing}
            minWidth="150px"
          >
            Stop Tailing
          </Button>
          <Button
            leftIcon={isPaused ? <FaPlay /> : <FaPause />}
            colorScheme="gray"
            onClick={togglePauseResume}
            isDisabled={!isTailing}
            minWidth="150px"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            flex="1"
            minWidth={{ base: '100%', md: '200px' }}
            bg="bg.secondary"
            borderColor="border.primary"
            color="text.primary"
            _focus={{ borderColor: 'accent.blue', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)' }}
          />
          <Button
            leftIcon={<FaEraser />}
            colorScheme="orange"
            onClick={clearLogs}
            minWidth="150px"
          >
            Clear
          </Button>
        </Flex>

        <Box
          ref={logViewerRef}
          bg="#0a0a1a" // Specific dark background for logs
          border="1px solid" borderColor="border.primary"
          borderRadius="lg"
          fontFamily="IBM Plex Mono"
          fontSize="sm"
          height="600px"
          overflowY="auto"
          p={4}
          boxShadow="inset 0 0 10px rgba(0, 255, 0, 0.1)"
          color="text.primary"
          position="relative"
          sx={{
            '::-webkit-scrollbar': { width: '8px' },
            '::-webkit-scrollbar-track': { background: 'bg.primary' },
            '::-webkit-scrollbar-thumb': { background: 'bg.card', borderRadius: '4px' },
            '::-webkit-scrollbar-thumb:hover': { background: 'accent.blue' },
          }}
        >
          {filteredLogs.length === 0 && !isLoading && (
            <Text color="text.secondary">Enter a directory name and click 'Start Tailing' to view logs.</Text>
          )}
          {filteredLogs.map((log, index) => (
            <Text key={index} fontFamily="IBM Plex Mono" fontSize="sm" display="flex" alignItems="baseline">
              <Text as="span" color="gray.500" mr="2">{log.timestamp}</Text>
              <Text as="span" fontWeight="bold" textTransform="uppercase" mr="2" color={log.level === 'INFO' ? 'blue.300' : log.level === 'WARN' ? 'orange.300' : log.level === 'ERROR' ? 'red.300' : log.level === 'SUCCESS' ? 'green.300' : 'gray.400'}>[{log.level.toUpperCase()}]</Text>
              <Text as="span" flex="1">{log.message}</Text>
            </Text>
          ))}
        </Box>
        {isLoading && (
          <Flex
            position="absolute"
            bottom="2rem"
            right="2rem"
            bg="rgba(0,0,0,0.7)"
            color="white"
            px={4}
            py={2}
            borderRadius="lg"
            align="center"
            gap={2}
            fontSize="sm"
          >
            <Spinner size="sm" /> Tailing logs...
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default LogsViewer;