"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Step = "choose" | "email" | "code"

export default function LoginClient({ name, role }: { name: string; role: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("choose")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/sendpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return }
      setStep("code")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const result = await signIn("credentials", { code, redirect: false })
    setLoading(false)
    if (result?.ok) router.push("/")
    else setError("Invalid or expired code. Please try again.")
  }

  function reset() { setStep("choose"); setEmail(""); setCode(""); setError("") }

  return (
    <main className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-12">
          <p className="cv-eyebrow mb-2">{role}</p>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--cv-ink)", letterSpacing: "-0.02em" }}>
            {name}
          </h1>
          <p style={{ color: "var(--cv-muted)" }}>Welcome — what would you like to do?</p>
        </div>

        {/* ── Choose ── */}
        {step === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link href="/" className="group flex flex-col gap-3 rounded-xl p-7 cv-display-card">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ background: "var(--cv-accent-soft)", color: "var(--cv-accent)" }}>
                &#128196;
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: "var(--cv-ink)" }}>View CV</h2>
                <p className="text-sm mt-1" style={{ color: "var(--cv-muted)" }}>
                  Browse publications, research and contact information
                </p>
              </div>
              <span className="text-sm font-medium mt-auto" style={{ color: "var(--cv-accent)" }}>
                Continue as visitor →
              </span>
            </Link>

            <button onClick={() => setStep("email")}
              className="group flex flex-col gap-3 rounded-xl p-7 text-left cv-display-card">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ border: "1px solid var(--cv-border)", color: "var(--cv-muted)" }}>
                &#128274;
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: "var(--cv-ink)" }}>Admin Access</h2>
                <p className="text-sm mt-1" style={{ color: "var(--cv-muted)" }}>
                  Sign in to edit and manage website content
                </p>
              </div>
              <span className="text-sm font-medium mt-auto" style={{ color: "var(--cv-muted)" }}>
                Sign in →
              </span>
            </button>
          </div>
        )}

        {/* ── Enter email ── */}
        {step === "email" && (
          <div className="cv-display-card max-w-sm mx-auto p-8">
            <h2 className="font-semibold mb-1" style={{ color: "var(--cv-ink)" }}>Admin Sign In</h2>
            <p className="text-sm mb-6" style={{ color: "var(--cv-muted)" }}>
              Enter your admin email and we'll send you a login code.
            </p>
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" autoFocus required className="cv-input" />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={loading} className="cv-btn-primary">
                {loading ? "Sending…" : "Send code"}
              </button>
              <button type="button" onClick={reset} className="text-sm transition hover:opacity-75"
                style={{ color: "var(--cv-meta)" }}>
                ← Back
              </button>
            </form>
          </div>
        )}

        {/* ── Enter code ── */}
        {step === "code" && (
          <div className="cv-display-card max-w-sm mx-auto p-8">
            <h2 className="font-semibold mb-1" style={{ color: "var(--cv-ink)" }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: "var(--cv-muted)" }}>
              We sent a 6-digit code to{" "}
              <span className="font-medium" style={{ color: "var(--cv-ink)" }}>{email}</span>.
              It expires in 10 minutes.
            </p>
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000" autoFocus required
                className="cv-input text-center tracking-[0.4em] font-mono" />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={loading || code.length !== 6} className="cv-btn-primary">
                {loading ? "Verifying…" : "Sign in"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setCode(""); setError("") }}
                className="text-sm transition hover:opacity-75" style={{ color: "var(--cv-meta)" }}>
                ← Resend code
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  )
}
