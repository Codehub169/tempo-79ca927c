import { Box, Flex, Text, Link as ChakraLink } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FaCode } from 'react-icons/fa'; // Changed from CodeIcon

function Header() {
  return (
    <Box as="header" bg="bg.secondary" p={{ base: 4, md: 8 }} borderBottom="1px" borderColor="border.color" boxShadow="dark" zIndex="1000">
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        <Flex align="center" className="logo">
          {/* Using FaCode from react-icons/fa */}
          <Box as={FaCode} w={8} h={8} mr={2} color="accent.blue" />
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="accent.blue">
            Codehub
          </Text>
        </Flex>
        <Flex as="nav">
          <Flex as="ul" listStyleType="none" display={{ base: "none", md: "flex" }}>
            <Box as="li" ml={{ base: 2, md: 8 }}>
              <ChakraLink
                as={NavLink}
                to="/"
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                _activeLink={{ color: 'text.primary', '&::after': { width: '100%' } }}
                fontSize="md"
                fontWeight="medium"
                py={2}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bg: 'accent.blue',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'width var(--transition-speed)',
                }}
              >
                Dashboard
              </ChakraLink>
            </Box>
            <Box as="li" ml={{ base: 2, md: 8 }}>
              <ChakraLink
                as={NavLink}
                to="/api-explorer"
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                _activeLink={{ color: 'text.primary', '&::after': { width: '100%' } }}
                fontSize="md"
                fontWeight="medium"
                py={2}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bg: 'accent.blue',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'width var(--transition-speed)',
                }}
              >
                API Explorer
              </ChakraLink>
            </Box>
            <Box as="li" ml={{ base: 2, md: 8 }}>
              <ChakraLink
                as={NavLink}
                to="/container-manager"
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                _activeLink={{ color: 'text.primary', '&::after': { width: '100%' } }}
                fontSize="md"
                fontWeight="medium"
                py={2}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bg: 'accent.blue',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'width var(--transition-speed)',
                }}
              >
                Container Manager
              </ChakraLink>
            </Box>
            <Box as="li" ml={{ base: 2, md: 8 }}>
              <ChakraLink
                as={NavLink}
                to="/logs-viewer"
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                _activeLink={{ color: 'text.primary', '&::after': { width: '100%' } }}
                fontSize="md"
                fontWeight="medium"
                py={2}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bg: 'accent.blue',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'width var(--transition-speed)',
                }}
              >
                Logs Viewer
              </ChakraLink>
            </Box>
            <Box as="li" ml={{ base: 2, md: 8 }}>
              <ChakraLink
                as={NavLink}
                to="/scheduled-tasks"
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                _activeLink={{ color: 'text.primary', '&::after': { width: '100%' } }}
                fontSize="md"
                fontWeight="medium"
                py={2}
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bg: 'accent.blue',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'width var(--transition-speed)',
                }}
              >
                Scheduled Tasks
              </ChakraLink>
            </Box>
          </Flex>
          {/* Hamburger menu for mobile will be added later if needed. */}
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
