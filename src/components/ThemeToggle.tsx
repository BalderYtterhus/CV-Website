"use client"

import { useTheme, type Background } from "./ThemeProvider"

const BG_OPTIONS: { value: Background; label: string; symbol: string }[] = [
  { value: "grid",      label: "Grid",      symbol: "⊞" },
  { value: "equations", label: "Equations", symbol: "∑" },
  { value: "plain",     label: "Plain",     symbol: "·" },
]

export default function ThemeToggle() {
  const { theme, background, toggleTheme, setBackground } = useTheme()

  const btnBase: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `1px solid var(--cv-border)`,
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    color: "var(--cv-meta)",
    transition: "border-color 150ms ease, color 150ms ease",
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {BG_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setBackground(opt.value)}
          title={opt.label}
          style={{
            ...btnBase,
            borderColor: background === opt.value ? "var(--cv-border-hover)" : "var(--cv-border)",
            color: background === opt.value ? "var(--cv-accent)" : "var(--cv-meta)",
          }}
        >
          {opt.symbol}
        </button>
      ))}

      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to dark" : "Switch to light"}
        style={{ ...btnBase, marginLeft: 4 }}
      >
        {theme === "light" ? "◑" : "○"}
      </button>
    </div>
  )
}
