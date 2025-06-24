import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/Providers'
import AuthProvider from '@/components/providers/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terapia virtual para ansiedad con MarIA | Desde $50 mil la sesión',
  description: 'Videollamada con MarIA, tu terapeuta virtual para la ansiedad. Solo $50.000 por sesión. Sin compromiso: paga después de la sesión y solo si te ayuda.',
  icons: {
    icon: '/img/MarIA.png',
    shortcut: '/img/MarIA.png',
    apple: '/img/MarIA.png',
  },
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
        {/* Google Tag Manager - Critical loading */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N9C77NVD');
            `,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BRQ072QNBC"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BRQ072QNBC');
            `,
          }}
        />
        {/* End Google Analytics */}
      </head>
      <body className={`flex flex-col min-h-screen ${inter.className} ${montserrat.className}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-N9C77NVD"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
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