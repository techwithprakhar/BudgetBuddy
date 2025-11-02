"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme")
      if (!saved) return false
      
      // Handle legacy "dark" string value or boolean JSON
      if (saved === "dark") return true
      if (saved === "light") return false
      
      // Try to parse as JSON (should be boolean)
      const parsed = JSON.parse(saved)
      return typeof parsed === "boolean" ? parsed : false
    } catch (error) {
      // If JSON parsing fails, check for string values
      const saved = localStorage.getItem("theme")
      if (saved === "dark") return true
      if (saved === "light") return false
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDark))
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}
