"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")
}

// ─── Publications ────────────────────────────────────────────────────────────

export async function createPublication(data: {
  title: string; authors: string; date: string; description: string; url: string
}) {
  await requireAdmin()
  await prisma.publication.create({ data: { ...data, date: new Date(data.date) } })
  revalidatePath("/publications")
}

export async function updatePublication(id: string, data: {
  title: string; authors: string; date: string; description: string; url: string
}) {
  await requireAdmin()
  await prisma.publication.update({ where: { id }, data: { ...data, date: new Date(data.date) } })
  revalidatePath("/publications")
}

export async function deletePublication(id: string) {
  await requireAdmin()
  await prisma.publication.delete({ where: { id } })
  revalidatePath("/publications")
}

// ─── Education ───────────────────────────────────────────────────────────────

export async function createEducation(data: {
  institution: string; degree: string; field: string; startDate: string; endDate: string; description: string
}) {
  await requireAdmin()
  await prisma.education.create({
    data: {
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      description: data.description || null,
    },
  })
  revalidatePath("/")
}

export async function updateEducation(id: string, data: {
  institution: string; degree: string; field: string; startDate: string; endDate: string; description: string
}) {
  await requireAdmin()
  await prisma.education.update({
    where: { id },
    data: {
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      description: data.description || null,
    },
  })
  revalidatePath("/")
}

export async function deleteEducation(id: string) {
  await requireAdmin()
  await prisma.education.delete({ where: { id } })
  revalidatePath("/")
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export async function createSkill(data: {
  name: string; category: string; level: string
}) {
  await requireAdmin()
  await prisma.skill.create({
    data: {
      name: data.name,
      category: data.category || null,
      level: data.level || null,
    },
  })
  revalidatePath("/")
}

export async function updateSkill(id: string, data: {
  name: string; category: string; level: string
}) {
  await requireAdmin()
  await prisma.skill.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category || null,
      level: data.level || null,
    },
  })
  revalidatePath("/")
}

export async function deleteSkill(id: string) {
  await requireAdmin()
  await prisma.skill.delete({ where: { id } })
  revalidatePath("/")
}

// ─── Research ────────────────────────────────────────────────────────────────

export async function createResearch(data: {
  title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string
}) {
  await requireAdmin()
  await prisma.research.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      url: data.url || null,
    },
  })
  revalidatePath("/research")
}

export async function updateResearch(id: string, data: {
  title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string
}) {
  await requireAdmin()
  await prisma.research.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      url: data.url || null,
    },
  })
  revalidatePath("/research")
}

export async function deleteResearch(id: string) {
  await requireAdmin()
  await prisma.research.delete({ where: { id } })
  revalidatePath("/research")
}

// ─── Algorithm ───────────────────────────────────────────────────────────────

export async function createAlgorithm(data: {
  title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string
}) {
  await requireAdmin()
  await prisma.algorithm.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      url: data.url || null,
    },
  })
  revalidatePath("/algorithms")
}

export async function updateAlgorithm(id: string, data: {
  title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string
}) {
  await requireAdmin()
  await prisma.algorithm.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      url: data.url || null,
    },
  })
  revalidatePath("/algorithms")
}

export async function deleteAlgorithm(id: string) {
  await requireAdmin()
  await prisma.algorithm.delete({ where: { id } })
  revalidatePath("/algorithms")
}

// ─── SiteSettings ────────────────────────────────────────────────────────────

// Image fields use a sentinel: "keep" = don't change, null = clear, string = new base64
export async function updateSiteSettings(data: {
  name: string
  role: string
  bio: string
  profileImage: string | null | "keep"
  backgroundImage: string | null | "keep"
}) {
  await requireAdmin()

  const imageUpdate: { profileImage?: string | null; backgroundImage?: string | null } = {}
  if (data.profileImage !== "keep") imageUpdate.profileImage = data.profileImage
  if (data.backgroundImage !== "keep") imageUpdate.backgroundImage = data.backgroundImage

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { name: data.name, role: data.role, bio: data.bio, ...imageUpdate },
    create: {
      id: "main",
      name: data.name,
      role: data.role,
      bio: data.bio,
      profileImage: data.profileImage === "keep" ? null : data.profileImage,
      backgroundImage: data.backgroundImage === "keep" ? null : data.backgroundImage,
    },
  })
  revalidatePath("/", "layout")
}

export async function resetSiteImages() {
  await requireAdmin()
  await prisma.siteSettings.update({
    where: { id: "main" },
    data: { profileImage: null, backgroundImage: null },
  })
  revalidatePath("/", "layout")
}

// ─── ContactInfo ─────────────────────────────────────────────────────────────

export async function updateContactInfo(data: {
  email: string; office: string; department: string; officeHours: string; university: string; location: string
}) {
  await requireAdmin()
  await prisma.contactInfo.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  })
  revalidatePath("/contact")
}
