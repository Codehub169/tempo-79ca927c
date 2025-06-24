import React from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';

const ApiExplorer = () => {
  return (
    <Box p={8} maxWidth="1400px" mx="auto" width="100%">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="text.primary" letterSpacing="0.05em">
        API Explorer
      </Heading>
      <Box bg="bg.card" border="1px solid" borderColor="border.color" borderRadius="lg" p={6} boxShadow="lg">
        <Text fontSize="lg" color="text.primary" mb={4}>
          This page will allow you to explore and interact with various API endpoints.
        </Text>
        <Text color="text.secondary">
          Details about available APIs and their functionalities will be displayed here.
        </Text>
        <Flex mt={6} justifyContent="center">
          {/* Future: Add API listing, request forms, and response display here */}
        </Flex>
      </Box>
    </Box>
  );
};

export default ApiExplorer;
