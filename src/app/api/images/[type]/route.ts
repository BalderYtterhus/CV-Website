import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const settings = await prisma.siteSettings.findFirst()

  const dataUrl =
    type === "profile"
      ? settings?.profileImage
      : type === "background"
      ? settings?.backgroundImage
      : null

  if (!dataUrl) {
    return new Response(null, { status: 404 })
  }

  // dataUrl format: "data:<mime>;base64,<data>"
  const commaIndex = dataUrl.indexOf(",")
  const header = dataUrl.slice(0, commaIndex)
  const base64Data = dataUrl.slice(commaIndex + 1)
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg"
  const buffer = Buffer.from(base64Data, "base64")

  return new Response(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "no-store",
    },
  })
}
