import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyOtp } from "@/lib/otpStore"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const code = credentials?.code
        if (!code) return null

        const valid = await verifyOtp(code)
        if (!valid) return null

        return { id: "admin", name: "Admin" }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.isAdmin = true
      return token
    },
    async session({ session, token }) {
      if (token.isAdmin) session.user = { ...session.user, name: "Admin" }
      return session
    },
  },
}
