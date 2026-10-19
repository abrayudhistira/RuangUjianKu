import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavigationProgress from '@/components/ui/NavigationProgress'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ruang UjianKu',
  description: 'Aplikasi ujian online berbasis web',
  icons: {
    icon: '/app-icon.png',
    shortcut: '/app-icon.png',
    apple: '/app-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}