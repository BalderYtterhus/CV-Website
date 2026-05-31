"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type Theme = "light" | "dark"
export type Background = "grid" | "equations" | "plain"

interface ThemeContextValue {
  theme: Theme
  background: Background
  setTheme: (t: Theme) => void
  setBackground: (b: Background) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  background: "grid",
  setTheme: () => {},
  setBackground: () => {},
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [background, setBackgroundState] = useState<Background>("grid")

  // On mount: read localStorage, fall back to prefers-color-scheme
  useEffect(() => {
    const storedTheme = localStorage.getItem("cv-theme")
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setThemeState(prefersDark ? "dark" : "light")
    }

    const storedBg = localStorage.getItem("cv-background")
    if (storedBg === "grid" || storedBg === "equations" || storedBg === "plain") {
      setBackgroundState(storedBg)
    }
  }, [])

  // Sync theme → html[data-theme] + localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("cv-theme", theme)
  }, [theme])

  // Sync background → localStorage
  useEffect(() => {
    localStorage.setItem("cv-background", background)
  }, [background])

  return (
    <ThemeContext.Provider value={{
      theme,
      background,
      setTheme: setThemeState,
      setBackground: setBackgroundState,
      toggleTheme: () => setThemeState((t) => (t === "light" ? "dark" : "light")),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
