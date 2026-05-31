"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{ color: "var(--cv-meta)" }}
      className="text-sm font-medium transition-colors hover:text-red-500"
    >
      Sign Out
    </button>
  )
}
