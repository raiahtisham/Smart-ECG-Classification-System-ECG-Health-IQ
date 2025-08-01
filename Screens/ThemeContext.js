import React, { createContext, useContext, useState } from "react";
import { LightTheme, DarkTheme } from "./theme"; // Correct path to theme.js

// Create the theme context
const ThemeContext = createContext();

// Custom hook to access the theme context
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  // Set the initial theme state (false = LightTheme, true = DarkTheme)
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to LightTheme

  // Function to toggle between Light and Dark themes
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Log the current theme for debugging purposes
  console.log(
    "Theme Context initialized:",
    isDarkMode ? DarkTheme : LightTheme
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: isDarkMode ? DarkTheme : LightTheme,
        toggleTheme,
        isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
