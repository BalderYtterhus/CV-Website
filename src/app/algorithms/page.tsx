import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AlgorithmManager } from "@/components/admin/AlgorithmManager"

export const dynamic = "force-dynamic"

export default async function AlgorithmsPage() {
  const [algorithms, session] = await Promise.all([
    prisma.algorithm.findMany({ where: { deletedAt: null }, orderBy: { startDate: "desc" } }),
    getServerSession(authOptions),
  ])

  const data = algorithms.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    startDate: a.startDate.toISOString(),
    endDate: a.endDate ? a.endDate.toISOString() : null,
    status: a.status,
    tags: a.tags,
    url: a.url,
  }))

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="cv-eyebrow mb-2">Computational Work</p>
        <h1 className="text-5xl font-bold" style={{ color: "var(--cv-ink)", letterSpacing: "-0.02em" }}>Algorithms</h1>
        <p className="mt-4 max-w-xl" style={{ color: "var(--cv-muted)" }}>
          Research projects and contributions in algorithm design, analysis, and
          complexity theory.
        </p>
      </div>
      <AlgorithmManager algorithms={data} isAdmin={!!session} />
    </main>
  )
}
