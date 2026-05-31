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
    prisma.education.findMany({ orderBy: { startDate: "desc" } }),
    prisma.skill.findMany({ orderBy: { category: "asc" } }),
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

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center gap-12 mb-20">
        <div className="w-48 h-48 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {settings.profileImage ? (
            <img src="/api/images/profile" alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-widest">
              {settings.role}
            </p>
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {settings.name}
          </h1>
          <p className="text-lg text-gray-500 max-w-xl">
            {settings.bio}
          </p>
          <div className="flex gap-4 mt-6">
            <Link
              href="/publications"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              View Publications
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
        <EducationManager education={eduData} isAdmin={isAdmin} />
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
        <SkillManager skills={skillData} isAdmin={isAdmin} />
      </section>

    </main>
  )
}
