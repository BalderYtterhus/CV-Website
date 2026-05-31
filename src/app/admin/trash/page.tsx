import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TrashManager } from "@/components/admin/TrashManager"

export const dynamic = "force-dynamic"

export default async function TrashPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const [publications, education, skills, research, algorithms] = await Promise.all([
    prisma.publication.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    prisma.education.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    prisma.skill.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    prisma.research.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
    prisma.algorithm.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" } }),
  ])

  const total = publications.length + education.length + skills.length + research.length + algorithms.length

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="cv-eyebrow mb-2">Admin</p>
        <h1 className="text-5xl font-bold mb-3" style={{ color: "var(--cv-ink)", letterSpacing: "-0.02em" }}>
          Trash
        </h1>
        <p style={{ color: "var(--cv-muted)" }}>
          {total === 0 ? "Nothing in the trash." : `${total} deleted item${total !== 1 ? "s" : ""} — restore or permanently delete.`}
        </p>
      </div>

      <TrashManager
        publications={publications.map((p) => ({
          id: p.id, type: "publication", label: p.title,
          subtitle: p.authors, deletedAt: p.deletedAt!.toISOString(),
        }))}
        education={education.map((e) => ({
          id: e.id, type: "education", label: e.degree,
          subtitle: e.institution, deletedAt: e.deletedAt!.toISOString(),
        }))}
        skills={skills.map((s) => ({
          id: s.id, type: "skill", label: s.name,
          subtitle: s.category ?? undefined, deletedAt: s.deletedAt!.toISOString(),
        }))}
        research={research.map((r) => ({
          id: r.id, type: "research", label: r.title,
          subtitle: r.status, deletedAt: r.deletedAt!.toISOString(),
        }))}
        algorithms={algorithms.map((a) => ({
          id: a.id, type: "algorithm", label: a.title,
          subtitle: a.status, deletedAt: a.deletedAt!.toISOString(),
        }))}
      />
    </main>
  )
}
