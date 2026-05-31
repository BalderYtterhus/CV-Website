import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EducationManager } from "@/components/admin/EducationManager"
import { SkillManager } from "@/components/admin/SkillManager"
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [education, skills, session, settings] = await Promise.all([
    prisma.education.findMany({ where: { deletedAt: null }, orderBy: { startDate: "desc" } }),
    prisma.skill.findMany({ where: { deletedAt: null }, orderBy: { category: "asc" } }),
    getServerSession(authOptions),
    prisma.siteSettings.upsert({
      where: { id: "main" },
      update: {},
      create: {
        id: "main",
        name: "Marcelo De Martino",
        role: "Professor · Researcher",
        bio: "Advancing the frontiers of computational research at the intersection of algorithms, mathematics, and applied science.",
      },
    }),
  ])

  const isAdmin = !!session

  const eduData = education.map((e) => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    field: e.field,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    description: e.description,
  }))

  const skillData = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
  }))

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row items-center gap-12 mb-20">

        {/* Avatar */}
        <div
          className="w-48 h-48 rounded-full flex-shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--cv-avatar-from), var(--cv-avatar-to))`,
            boxShadow: "var(--cv-card-shadow)",
          }}
        >
          {settings.profileImage && (
            <img src="/api/images/profile" alt="Profile" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="cv-eyebrow">{settings.role}</p>
            {isAdmin && (
              <SiteSettingsManager settings={{
                name: settings.name,
                role: settings.role,
                bio: settings.bio,
                hasProfileImage: !!settings.profileImage,
                hasBackgroundImage: !!settings.backgroundImage,
              }} />
            )}
          </div>

          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: "var(--cv-ink)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            {settings.name}
          </h1>

          <p
            className="text-lg max-w-xl"
            style={{ color: "var(--cv-muted)", lineHeight: 1.5 }}
          >
            {settings.bio}
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 mt-6">
            <Link
              href="/publications"
              style={{
                background: "var(--cv-btn-primary-bg)",
                color: "var(--cv-btn-primary-ink)",
                boxShadow: "var(--cv-card-shadow)",
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            >
              View Publications
            </Link>
            <Link
              href="/contact"
              style={{
                background: "var(--cv-btn-secondary-bg)",
                color: "var(--cv-btn-secondary-ink)",
                border: "1px solid var(--cv-btn-secondary-border)",
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-75"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Education ────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--cv-ink)" }}
        >
          Education
        </h2>
        <EducationManager education={eduData} isAdmin={isAdmin} />
      </section>

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <section>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--cv-ink)" }}
        >
          Skills
        </h2>
        <SkillManager skills={skillData} isAdmin={isAdmin} />
      </section>

    </main>
  )
}
