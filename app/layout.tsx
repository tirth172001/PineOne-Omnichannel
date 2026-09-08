import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import localFont from 'next/font/local'
import './globals.css'

const interDisplay = localFont({
  src: [
    { path: '../public/fonts/inter-display/InterDisplay-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/inter-display/InterDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/inter-display/InterDisplay-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/inter-display/InterDisplay-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/inter-display/InterDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter-display',
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
    <html lang="en" suppressHydrationWarning className={`font-sans ${interDisplay.variable}`}>
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
