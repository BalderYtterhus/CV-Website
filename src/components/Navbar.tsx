import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import LogoutButton from "@/components/LogoutButton"
import ThemeToggle from "@/components/ThemeToggle"

const NAV_LINKS = [
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

  const name    = settings?.name ?? "Marcelo De Martino"
  const isAdmin = !!session

  return (
    <header
      style={{
        borderBottom: "1px solid var(--cv-border)",
        boxShadow: "var(--cv-line-shadow)",
        backdropFilter: "blur(2px)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
      className="w-full"
    >

      {/* ── Top bar (always visible) ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-10 py-3 sm:py-4">

        {/* Name — muted + small on mobile, full ink + larger on desktop */}
        <Link
          href="/"
          className="font-medium transition-opacity hover:opacity-75 truncate pr-3"
          style={{ letterSpacing: "-0.01em" }}
        >
          <span
            className="sm:hidden text-sm"
            style={{ color: "var(--cv-meta)" }}
          >
            {name}
          </span>
          <span
            className="hidden sm:inline text-lg font-semibold"
            style={{ color: "var(--cv-ink)" }}
          >
            {name}
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">

          {/* Desktop-only nav links */}
          <nav className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "var(--cv-muted)" }}
                className="text-sm font-medium transition-colors hover:text-cv-ink"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/trash"
                style={{ color: "var(--cv-meta)" }}
                className="text-sm font-medium transition-colors hover:text-cv-muted"
              >
                Trash
              </Link>
            )}
          </nav>

          {/* Auth — always visible */}
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

          {/* Theme + background toggle — always visible */}
          <ThemeToggle />
        </div>
      </div>

      {/* ── Mobile-only scrollable link strip ────────────────────────────── */}
      <div
        className="sm:hidden cv-nav-scroll overflow-x-auto"
        style={{ borderTop: "1px solid var(--cv-border)" }}
      >
        <nav className="flex items-center gap-7 px-5 py-2.5 w-max">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: "var(--cv-muted)" }}
              className="text-sm font-medium whitespace-nowrap transition-colors hover:text-cv-ink"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/trash"
              style={{ color: "var(--cv-meta)" }}
              className="text-sm font-medium whitespace-nowrap transition-colors hover:text-cv-muted"
            >
              Trash
            </Link>
          )}
        </nav>
      </div>

    </header>
  )
}
