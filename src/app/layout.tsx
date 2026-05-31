import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { prisma } from "@/lib/prisma"
import { Analytics } from "@vercel/analytics/next"
import ThemeProvider from "@/components/ThemeProvider"
import BackgroundLayer from "@/components/BackgroundLayer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Marcelo De Martino",
  description: "Professor | Researcher",
}

// Runs before React hydration to set data-theme without flash
const themeInitScript = `(function(){try{var t=localStorage.getItem('cv-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await prisma.siteSettings.findFirst()
  const hasUserBackground = !!settings?.backgroundImage

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-full flex flex-col`}
        style={hasUserBackground ? {
          backgroundImage: "url(/api/images/background)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        } : {}}
      >
        {/* Prevent flash of wrong theme before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <BackgroundLayer hasUserBackground={hasUserBackground} />
          <div className="relative flex flex-col min-h-full" style={{ zIndex: 1 }}>
            <Navbar />
            {children}
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
