import { prisma } from "@/lib/prisma"
import LoginClient from "./LoginClient"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const settings = await prisma.siteSettings.findFirst()

  return (
    <LoginClient
      name={settings?.name ?? "Marcelo De Martino"}
      role={settings?.role ?? "Professor · Researcher"}
    />
  )
}
