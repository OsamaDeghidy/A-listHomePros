import React, { createContext, useState, useContext, useEffect } from 'react';

// Dark Mode Context
const DarkModeContext = createContext();

// Dark Mode Provider Component
export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Set specific theme
  const setDarkMode = (value) => {
    setIsDarkMode(value);
    localStorage.setItem('darkMode', JSON.stringify(value));
  };

  // Update HTML class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if no manual preference is saved
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Custom hook to use dark mode context
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  
  return context;
};

export default DarkModeContext; 