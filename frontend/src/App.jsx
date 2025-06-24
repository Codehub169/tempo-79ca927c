import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ApiExplorer from './pages/ApiExplorer';
import ContainerManager from './pages/ContainerManager';
import LogsViewer from './pages/LogsViewer';
import ScheduledTasks from './pages/ScheduledTasks';

function App() {
  return (
    <Router>
      <Box className="flex flex-col min-h-screen">
        <Header />
        <Box as="main" className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/api-explorer" element={<ApiExplorer />} />
            <Route path="/container-manager" element={<ContainerManager />} />
            <Route path="/logs-viewer" element={<LogsViewer />} />
            <Route path="/scheduled-tasks" element={<ScheduledTasks />} />
            {/* Add a catch-all route for 404 if desired */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
