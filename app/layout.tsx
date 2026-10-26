import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/site/theme-provider"
import "./globals.css"

const appSans = Inter({
  variable: "--font-afterglow-sans",
  subsets: ["latin"],
})

const appMono = Geist_Mono({
  variable: "--font-afterglow-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Afterglow UI",
  description:
    "Animated React components that leave a little light behind. Copy, paste, own the code.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${appSans.variable} ${appMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
