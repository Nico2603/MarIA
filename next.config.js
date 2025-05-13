/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Optimizaciones para HTTP/2
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Configuración para manejo de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
  
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            // NOTA: 'unsafe-eval' se añade para GSAP. 'unsafe-inline' puede ser necesario para estilos/scripts inline.
            // Considera ajustar estas directivas según tus necesidades específicas y entorno (desarrollo vs producción).
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: lh3.googleusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.livekit.cloud wss://*.livekit.cloud; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';".replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },

  webpack(config) {
    const path = require('path');
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
}

module.exports = nextConfig 