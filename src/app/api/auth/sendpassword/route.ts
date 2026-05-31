import { NextRequest } from "next/server"
import { Resend } from "resend"
import { generateCode, saveOtp } from "@/lib/otpStore"

export async function POST(req: NextRequest) {
  try {
    // ── Validate environment ──────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL
    const resendKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM ?? "onboarding@resend.dev"

    if (!adminEmail || !resendKey) {
      console.error("Missing ADMIN_EMAIL or RESEND_API_KEY in environment")
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // ── Parse request body ────────────────────────────────────────────────────
    let email: string | undefined
    try {
      const body = await req.json()
      email = body?.email
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    // ── Security: same response whether email matches or not ─────────────────
    // This prevents an attacker from discovering the admin email.
    if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      return Response.json({ success: true })
    }

    // ── Generate and store OTP ────────────────────────────────────────────────
    const code = generateCode()
    await saveOtp(code)

    // ── Send email via Resend ─────────────────────────────────────────────────
    const resend = new Resend(resendKey)

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: "Your login code",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 48px 24px; color: #111;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Your login code</h2>
          <p style="color: #666; margin: 0 0 32px; font-size: 15px;">
            Enter this code to sign in to your CV admin panel.
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 44px; font-weight: 700; letter-spacing: 10px; color: #111; font-variant-numeric: tabular-nums;">
              ${code}
            </span>
          </div>
          <p style="color: #999; font-size: 13px; margin: 0;">
            Expires in 10 minutes. Only one code is valid at a time.<br/>
            If you did not request this, ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return Response.json({ error: "Failed to send email" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Unexpected error in sendpassword:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
