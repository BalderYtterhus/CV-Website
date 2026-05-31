import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import LogoutButton from "@/components/LogoutButton"

const links = [
  { label: "Home", href: "/" },
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Algorithms", href: "/algorithms" },
  { label: "Contact", href: "/contact" },
]

export default async function Navbar() {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    prisma.siteSettings.findFirst(),
  ])

  const name = settings?.name ?? "Marcelo De Martino"

  return (
    <header className="w-full border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg hover:text-blue-700 transition">
        {name}
      </Link>
      <nav className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
          >
            {link.label}
          </Link>
        ))}
        {session ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Log in
          </Link>
        )}
      </nav>
    </header>
  )
}
