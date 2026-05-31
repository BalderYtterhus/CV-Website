import { prisma } from "@/lib/prisma"
import { randomInt } from "crypto"

const OTP_EXPIRY_MINUTES = 10

/** Generates a cryptographically random 6-digit code */
export function generateCode(): string {
  return randomInt(100000, 999999).toString()
}

/**
 * Saves a new OTP to the database.
 * Deletes all previous OTPs first so only one is ever valid at a time.
 */
export async function saveOtp(code: string): Promise<void> {
  await prisma.otp.deleteMany()
  await prisma.otp.create({
    data: {
      code,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })
}

/**
 * Verifies a submitted code.
 * Returns true if the code is correct, unused, and not expired.
 * Marks it as used on success so it cannot be reused.
 */
export async function verifyOtp(code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: {
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  })

  if (!otp) return false

  await prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  })

  return true
}
