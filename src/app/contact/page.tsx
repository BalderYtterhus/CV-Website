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
        <p className="text-sm font-medium text-blue-600 uppercase tracking-widest mb-2">
          Get in Touch
        </p>
        <div className="flex items-center gap-4">
          <h1 className="text-5xl font-bold text-gray-900">Contact</h1>
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
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email</p>
            <a href={`mailto:${contact.email}`} className="text-gray-900 font-medium hover:text-blue-600 transition">
              {contact.email}
            </a>
          </div>
        )}

        {(contact.office || contact.department) && (
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Office</p>
            {contact.office && <p className="text-gray-900 font-medium">{contact.office}</p>}
            {contact.department && <p className="text-sm text-gray-500 mt-1">{contact.department}</p>}
          </div>
        )}

        {contact.officeHours && (
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Office Hours</p>
            <p className="text-gray-900 font-medium">{contact.officeHours}</p>
          </div>
        )}

        {(contact.university || contact.location) && (
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">University</p>
            {contact.university && <p className="text-gray-900 font-medium">{contact.university}</p>}
            {contact.location && <p className="text-sm text-gray-500 mt-1">{contact.location}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
