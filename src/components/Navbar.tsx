import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import LogoutButton from "@/components/LogoutButton"
import ThemeToggle from "@/components/ThemeToggle"

const links = [
  { label: "Home",         href: "/" },
  { label: "Research",     href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Algorithms",   href: "/algorithms" },
  { label: "Contact",      href: "/contact" },
]

export default async function Navbar() {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    prisma.siteSettings.findFirst(),
  ])

  const name = settings?.name ?? "Marcelo De Martino"

  return (
    <header
      style={{
        borderBottom: "1px solid var(--cv-border)",
        boxShadow: "var(--cv-line-shadow)",
        backdropFilter: "blur(2px)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
      className="w-full px-10 py-4 flex items-center justify-between"
    >
      <Link
        href="/"
        style={{ color: "var(--cv-ink)", letterSpacing: "-0.01em" }}
        className="font-semibold text-lg transition-colors hover:opacity-80"
      >
        {name}
      </Link>

      <nav className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ color: "var(--cv-muted)" }}
            className="text-sm font-medium transition-colors hover:text-cv-ink"
          >
            {link.label}
          </Link>
        ))}

        {session && (
          <Link
            href="/admin/trash"
            style={{ color: "var(--cv-meta)" }}
            className="text-sm font-medium transition-colors hover:text-cv-muted"
          >
            Trash
          </Link>
        )}

        {session ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            style={{ color: "var(--cv-meta)" }}
            className="text-sm font-medium transition-colors hover:text-cv-muted"
          >
            Log in
          </Link>
        )}

        <ThemeToggle />
      </nav>
    </header>
  )
}
