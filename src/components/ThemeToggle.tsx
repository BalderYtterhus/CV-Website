"use client"

import { useTheme, type Background } from "./ThemeProvider"

const BG_OPTIONS: { value: Background; label: string; symbol: string }[] = [
  { value: "grid",      label: "Grid",      symbol: "⊞" },
  { value: "equations", label: "Equations", symbol: "∑" },
  { value: "plain",     label: "Plain",     symbol: "—" },
]

export default function ThemeToggle() {
  const { theme, background, toggleTheme, setBackground } = useTheme()

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
      {/* Background pickers */}
      {BG_OPTIONS.map((opt) => {
        const active = background === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setBackground(opt.value)}
            title={opt.label}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: `1px solid ${active ? "var(--cv-accent)" : "var(--cv-border)"}`,
              background: active ? "var(--cv-accent-soft)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 500,
              color: active ? "var(--cv-accent)" : "var(--cv-body)",
              transition: "all 150ms ease",
            }}
          >
            {opt.symbol}
          </button>
        )
      })}

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: "var(--cv-border)", margin: "0 4px" }} />

      {/* Light / dark toggle */}
      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to dark" : "Switch to light"}
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          border: "1px solid var(--cv-border)",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          color: "var(--cv-body)",
          transition: "all 150ms ease",
        }}
      >
        {theme === "light" ? "☽" : "☀"}
      </button>
    </div>
  )
}
