import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Marcelo De Martino",
  description: "Professor | Researcher",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await prisma.siteSettings.findFirst()
  const hasBg = !!settings?.backgroundImage

  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${inter.className} min-h-full flex flex-col`}
        style={hasBg ? {
          backgroundImage: "url(/api/images/background)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        } : {}}
      >
        <Navbar />
        {children}
      </body>
    </html>
  )
}