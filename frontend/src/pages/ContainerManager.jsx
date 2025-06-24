import React from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';

const ContainerManager = () => {
  return (
    <Box p={8} maxWidth="1400px" mx="auto" width="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="text.primary" letterSpacing="0.05em">
        Container Manager
      </Heading>
      <Box bg="bg.card" border="1px solid" borderColor="border.color" borderRadius="lg" p={6} boxShadow="lg">
        <Text fontSize="lg" color="text.primary" mb={4}>
          This page will display and allow management of Docker containers.
        </Text>
        <Text color="text.secondary">
          You can view container status, start, stop, or restart containers here.
        </Text>
        <Flex mt={6} justifyContent="center">
          {/* Future: Add container listing, actions, and details here */}
        </Flex>
      </Box>
    </Box>
  );
};

export default ContainerManager;
