"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Step = "choose" | "email" | "code"

export default function LoginClient({
  name,
  role,
}: {
  name: string
  role: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("choose")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // ── Step 1: send OTP to email ─────────────────────────────────────────────
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/sendpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      // Always advance to code step — even if email didn't match,
      // we don't reveal that to the user.
      setStep("code")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: verify OTP and sign in ───────────────────────────────────────
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      code,
      redirect: false,
    })

    setLoading(false)

    if (result?.ok) {
      router.push("/")
    } else {
      setError("Invalid or expired code. Please try again.")
    }
  }

  function reset() {
    setStep("choose")
    setEmail("")
    setCode("")
    setError("")
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-12">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-2">
            {role}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{name}</h1>
          <p className="text-gray-500">Welcome — what would you like to do?</p>
        </div>

        {/* ── Choose ── */}
        {step === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              href="/"
              className="group flex flex-col gap-3 border border-gray-200 rounded-xl p-7 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                &#128196;
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                  View CV
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Browse publications, research and contact information
                </p>
              </div>
              <span className="text-sm font-medium text-blue-600 mt-auto">
                Continue as visitor →
              </span>
            </Link>

            <button
              onClick={() => setStep("email")}
              className="group flex flex-col gap-3 border border-gray-200 rounded-xl p-7 hover:border-gray-400 hover:shadow-sm transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-lg">
                &#128274;
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-gray-800 transition">
                  Admin Access
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to edit and manage website content
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600 mt-auto">
                Sign in →
              </span>
            </button>
          </div>
        )}

        {/* ── Enter email ── */}
        {step === "email" && (
          <div className="border border-gray-200 rounded-xl p-8 max-w-sm mx-auto">
            <h2 className="font-semibold text-gray-900 mb-1">Admin Sign In</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your admin email and we'll send you a login code.
            </p>
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoFocus
                required
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send code"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Back
              </button>
            </form>
          </div>
        )}

        {/* ── Enter code ── */}
        {step === "code" && (
          <div className="border border-gray-200 rounded-xl p-8 max-w-sm mx-auto">
            <h2 className="font-semibold text-gray-900 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>.
              It expires in 10 minutes.
            </p>
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                required
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-center tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setError("") }}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Resend code
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  )
}
