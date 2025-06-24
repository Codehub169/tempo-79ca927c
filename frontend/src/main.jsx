import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App.jsx';
import './index.css';

// Extend the Chakra UI theme to integrate with Tailwind CSS variables
// and custom fonts defined in tailwind.config.js and index.css
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'var(--bg-primary)',
        color: 'var(--text-color)',
        fontFamily: 'var(--font-family)',
        lineHeight: '1.6',
      },
    },
  },
  colors: {
    bg: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      card: 'var(--bg-card)',
    },
    text: {
      primary: 'var(--text-color)',
      secondary: 'var(--text-secondary)',
    },
    accent: {
      blue: 'var(--accent-blue)',
      green: 'var(--accent-green)',
      red: 'var(--accent-red)',
      orange: 'var(--accent-orange)',
    },
    border: {
      color: 'var(--border-color)',
    },
  },
  fonts: {
    heading: 'var(--font-family)',
    body: 'var(--font-family)',
    mono: 'var(--font-code)',
  },
  radii: {
    md: 'var(--border-radius)',
  },
  shadows: {
    light: 'var(--shadow-light)',
    dark: 'var(--shadow-dark)',
  },
  transition: {
    speed: 'var(--transition-speed)',
  }
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
