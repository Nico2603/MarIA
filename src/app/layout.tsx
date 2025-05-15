import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import AuthProvider from '@/components/providers/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Mental Health - Asistente de salud mental',
  description: 'Asistente conversacional especializado en ansiedad y depresión con IA',
}

// Configuración de fuentes con next/font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`flex flex-col min-h-screen ${inter.className} ${montserrat.className}`}>
        <AuthProvider>
          <Providers>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
} 