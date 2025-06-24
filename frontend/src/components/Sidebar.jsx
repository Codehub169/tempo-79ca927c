import { Box, VStack, Button, Text, Flex, useTheme } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ endpoints, onSelectEndpoint, activePath, activeMethod }) => {
  const theme = useTheme();

  return (
    <Box
      as="aside"
      flexShrink={0}
      width={{ base: '100%', lg: '280px' }}
      bg={theme.colors.bg.secondary}
      borderRadius={theme.radii.md}
      p={{ base: '1rem', md: '1.5rem' }}
      boxShadow={theme.shadows.dark}
      overflowY="auto"
      maxH={{ base: 'auto', lg: 'calc(100vh - 120px)' }} // Adjust based on header height
    >
      <Text
        as="h2"
        fontSize={{ base: '1.2rem', md: '1.5rem' }}
        color={theme.colors.text.primary}
        mb="1.5rem"
        pb="0.8rem"
        borderBottom="1px solid"
        borderColor={theme.colors.border.color}
      >
        API Endpoints
      </Text>
      <VStack as="ul" spacing="0.5rem" align="stretch" listStyleType="none">
        {endpoints.map((endpoint) => (
          <Box as="li" key={`${endpoint.path}-${endpoint.method}`}>
            <Button
              as={NavLink}
              to="#"
              onClick={() => onSelectEndpoint(endpoint.path, endpoint.method, endpoint.spec)}
              display="flex"
              width="100%"
              textAlign="left"
              background="none"
              border="none"
              color={theme.colors.text.secondary}
              fontSize="1rem"
              py="0.8rem"
              px="1rem"
              borderRadius="6px"
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{
                bg: theme.colors.bg.card,
                color: theme.colors.text.primary,
              }}
              _active={{
                bg: theme.colors.accent.blue,
                color: 'white',
                fontWeight: '500',
              }}
              sx={{
                '&.active': {
                  bg: theme.colors.accent.blue,
                  color: 'white',
                  fontWeight: '500',
                },
                '&.active svg': {
                  color: 'white',
                },
              }}
              className={activePath === endpoint.path && activeMethod === endpoint.method ? 'active' : ''}
            >
              <Text
                as="span"
                fontWeight="700"
                px="0.6rem"
                py="0.2rem"
                borderRadius="4px"
                fontSize="0.75rem"
                minW="55px"
                textAlign="center"
                // Use Chakra UI theme colors which are mapped from CSS variables
                bg={endpoint.method.toLowerCase() === 'post' ? 'accent.orange' : 'accent.green'}
                color="gray.900" // Ensure text is visible on accent colors
              >
                {endpoint.method.toUpperCase()}
              </Text>
              {endpoint.path.replace(/\{(\w+)\}/g, ':$1')}
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;