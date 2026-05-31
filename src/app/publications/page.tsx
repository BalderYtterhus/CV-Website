import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PublicationManager } from "@/components/admin/PublicationManager"

export const dynamic = "force-dynamic"

export default async function PublicationsPage() {
  const [publications, session] = await Promise.all([
    prisma.publication.findMany({ orderBy: { date: "desc" } }),
    getServerSession(authOptions),
  ])

  const data = publications.map((p) => ({
    id: p.id,
    title: p.title,
    authors: p.authors,
    date: p.date.toISOString(),
    description: p.description,
    url: p.url,
  }))

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-2">
          Academic Work
        </p>
        <h1 className="text-5xl font-bold text-gray-900">Publications</h1>
      </div>
      <PublicationManager publications={data} isAdmin={!!session} />
    </main>
  )
}
