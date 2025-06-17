/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Configuración específica para Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.hotjar.com https://script.hotjar.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: lh3.googleusercontent.com https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://mentalia.digital https://*.livekit.cloud wss://*.livekit.cloud https://www.google-analytics.com https://analytics.google.com https://*.hotjar.com https://*.hotjar.io; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';".replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer, dev }) => {
    const path = require('path');
    
    // Configuración más robusta del alias @ para todos los entornos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Asegurar que las extensiones se resuelvan correctamente
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ...config.resolve.extensions];
    
    // Asegurar que el directorio base se resuelva correctamente
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules',
      ...(config.resolve.modules || [])
    ];
    
    // Configuración específica para Prisma
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    
    // Configuración adicional para producción
    if (!dev) {
      // Optimizaciones adicionales para producción
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    
    return config;
  },
}

module.exports = nextConfig 