"use client"

import { useTheme } from "./ThemeProvider"

const FORMULAS = [
  { t: "O(n log n)",       top: "6%",  left: "62%", size: 42, rot: -6 },
  { t: "P ≟ NP",           top: "15%", left: "8%",  size: 64, rot:  4 },
  { t: "∑ᵢ₌₁ⁿ aᵢ",        top: "30%", left: "70%", size: 56, rot: -3 },
  { t: "f(x) = ∫ g(t) dt", top: "46%", left: "5%",  size: 46, rot:  5 },
  { t: "∇·F = ρ/ε₀",       top: "60%", left: "64%", size: 50, rot: -4 },
  { t: "λx. x",            top: "74%", left: "12%", size: 58, rot:  3 },
  { t: "𝔼[X] = ∑ x·p(x)", top: "85%", left: "58%", size: 40, rot: -5 },
  { t: "ℂ ⊃ ℝ ⊃ ℚ",       top: "2%",  left: "30%", size: 38, rot:  2 },
]

export default function BackgroundLayer({ hasUserBackground }: { hasUserBackground: boolean }) {
  const { theme, background } = useTheme()

  // User uploaded a background image — let that show instead
  if (hasUserBackground) return null
  // No pattern requested
  if (background === "plain") return null

  const isDark = theme === "dark"
  const line       = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.045)"
  const lineStrong = isDark ? "rgba(255,255,255,0.07)"  : "rgba(15,23,42,0.075)"
  const inkFaint   = isDark ? "rgba(148,163,184,0.06)"  : "rgba(15,23,42,0.045)"

  if (background === "grid") {
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            `linear-gradient(${line} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${line} 1px, transparent 1px),` +
            `linear-gradient(${lineStrong} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${lineStrong} 1px, transparent 1px)`,
          backgroundSize: "32px 32px, 32px 32px, 160px 160px, 160px 160px",
          maskImage: "linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)",
        }}
      />
    )
  }

  if (background === "equations") {
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          maskImage: "linear-gradient(180deg, #000 0%, #000 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 70%, transparent 100%)",
        }}
      >
        {FORMULAS.map((f, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: f.top,
              left: f.left,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: f.size,
              color: inkFaint,
              transform: `rotate(${f.rot}deg)`,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {f.t}
          </span>
        ))}
      </div>
    )
  }

  return null
}
