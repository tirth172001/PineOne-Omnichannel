import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { GeistMono } from 'geist/font/mono'
import { Platypi } from 'next/font/google'
import './globals.css'

const platypi = Platypi({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-platypi',
  display: 'swap',
})
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AgentationDevtools } from "@/components/dev/agentation-devtools"

export const metadata: Metadata = {
  title: 'Pine One | Merchant Dashboard',
  description: 'Your unified platform for payments, growth, and business intelligence',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`font-sans ${GeistMono.variable} ${platypi.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="pine-one-theme"
        >
          <TooltipProvider>
            {children}
            <AgentationDevtools />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
