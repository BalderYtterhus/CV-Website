import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ContactManager } from "@/components/admin/ContactManager"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const [session, contact] = await Promise.all([
    getServerSession(authOptions),
    prisma.contactInfo.upsert({
      where: { id: "main" },
      update: {},
      create: {
        id: "main",
        email: "m.demartino@university.edu",
        office: "Room 314",
        department: "Department of Computer Science",
        officeHours: "Tuesday & Thursday, 14:00 – 16:00",
        university: "University Name",
        location: "City, Country",
      },
    }),
  ])

  const isAdmin = !!session

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <p className="cv-eyebrow mb-2">Get in Touch</p>
        <div className="flex items-center gap-4">
          <h1 className="text-5xl font-bold" style={{ color: "var(--cv-ink)", letterSpacing: "-0.02em" }}>Contact</h1>
          {isAdmin && (
            <ContactManager contact={{
              email: contact.email,
              office: contact.office,
              department: contact.department,
              officeHours: contact.officeHours,
              university: contact.university,
              location: contact.location,
            }} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {contact.email && (
          <div className="cv-card">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--cv-meta)" }}>Email</p>
            <a href={`mailto:${contact.email}`} className="font-medium transition-colors hover:text-cv-accent" style={{ color: "var(--cv-ink)" }}>
              {contact.email}
            </a>
          </div>
        )}

        {(contact.office || contact.department) && (
          <div className="cv-card">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--cv-meta)" }}>Office</p>
            {contact.office && <p className="font-medium" style={{ color: "var(--cv-ink)" }}>{contact.office}</p>}
            {contact.department && <p className="text-sm mt-1" style={{ color: "var(--cv-muted)" }}>{contact.department}</p>}
          </div>
        )}

        {contact.officeHours && (
          <div className="cv-card">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--cv-meta)" }}>Office Hours</p>
            <p className="font-medium" style={{ color: "var(--cv-ink)" }}>{contact.officeHours}</p>
          </div>
        )}

        {(contact.university || contact.location) && (
          <div className="cv-card">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--cv-meta)" }}>University</p>
            {contact.university && <p className="font-medium" style={{ color: "var(--cv-ink)" }}>{contact.university}</p>}
            {contact.location && <p className="text-sm mt-1" style={{ color: "var(--cv-muted)" }}>{contact.location}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
