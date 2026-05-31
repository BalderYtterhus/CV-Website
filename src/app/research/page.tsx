import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ResearchManager } from "@/components/admin/ResearchManager"

export const dynamic = "force-dynamic"

export default async function ResearchPage() {
  const [projects, session] = await Promise.all([
    prisma.research.findMany({ orderBy: { startDate: "desc" } }),
    getServerSession(authOptions),
  ])

  const data = projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate ? p.endDate.toISOString() : null,
    status: p.status,
    tags: p.tags,
    url: p.url,
  }))

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-2">
          Academic Work
        </p>
        <h1 className="text-5xl font-bold text-gray-900">Research</h1>
      </div>
      <ResearchManager projects={data} isAdmin={!!session} />
    </main>
  )
}
