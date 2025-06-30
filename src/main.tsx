import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply initial dark mode from localStorage if available
const storedTheme = localStorage.getItem('theme-storage');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (storedTheme) {
  const { state } = JSON.parse(storedTheme);
  if (state && state.isDarkMode) {
    document.documentElement.classList.add('dark');
  }
} else if (prefersDarkMode) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);