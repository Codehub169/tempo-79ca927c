import React from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';

const Dashboard = () => {
  return (
    <Box p={8} maxWidth="1400px" mx="auto" width="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="text.primary" letterSpacing="0.05em">
        Welcome to Codehub Dashboard
      </Heading>
      <Box bg="bg.card" border="1px solid" borderColor="border.color" borderRadius="lg" p={6} boxShadow="lg">
        <Text fontSize="lg" color="text.primary" mb={4}>
          This is your central hub for managing Codehub Execution Engine operations.
        </Text>
        <Text color="text.secondary">
          Use the navigation links above to explore API endpoints, manage containers, view logs, and schedule tasks.
        </Text>
        <Flex mt={6} justifyContent="center">
          {/* Future: Add quick links or summary widgets here */}
        </Flex>
      </Box>
    </Box>
  );
};

export default Dashboard;
