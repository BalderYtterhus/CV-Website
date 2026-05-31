import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AlgorithmManager } from "@/components/admin/AlgorithmManager"

export const dynamic = "force-dynamic"

export default async function AlgorithmsPage() {
  const [algorithms, session] = await Promise.all([
    prisma.algorithm.findMany({ orderBy: { startDate: "desc" } }),
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
        <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-2">
          Computational Work
        </p>
        <h1 className="text-5xl font-bold text-gray-900">Algorithms</h1>
        <p className="text-gray-500 mt-4 max-w-xl">
          Research projects and contributions in algorithm design, analysis, and
          complexity theory.
        </p>
      </div>
      <AlgorithmManager algorithms={data} isAdmin={!!session} />
    </main>
  )
}
