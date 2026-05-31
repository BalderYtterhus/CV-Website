"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "Research",     href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Algorithms",   href: "/algorithms" },
  { label: "Contact",      href: "/contact" },
]

type Props = {
  isAdmin: boolean
  mobile?: boolean
}

export function NavLinks({ isAdmin, mobile = false }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href)
  }

  const base = mobile
    ? "text-sm font-medium whitespace-nowrap transition-colors"
    : "text-sm font-medium transition-colors"

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={base}
            style={{
              color: active ? "var(--cv-ink)" : "var(--cv-muted)",
              fontWeight: active ? 600 : 500,
              borderBottom: active && !mobile ? "2px solid var(--cv-accent)" : undefined,
              paddingBottom: active && !mobile ? "2px" : undefined,
            }}
          >
            {link.label}
          </Link>
        )
      })}

      {isAdmin && (
        <Link
          href="/admin/trash"
          className={base}
          style={{
            color: pathname === "/admin/trash" ? "var(--cv-ink)" : "var(--cv-meta)",
            fontWeight: pathname === "/admin/trash" ? 600 : 500,
            borderBottom: pathname === "/admin/trash" && !mobile ? "2px solid var(--cv-accent)" : undefined,
            paddingBottom: pathname === "/admin/trash" && !mobile ? "2px" : undefined,
          }}
        >
          Trash
        </Link>
      )}
    </>
  )
}
