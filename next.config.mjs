/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para produção
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configuração para desenvolvimento local
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      root: process.cwd()
    }
  }),
  // Configurações para GCP
  serverExternalPackages: ['@prisma/client'],
  // Headers de segurança
  async headers() {
    return [
      {
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
        ],
      },
    ];
  },
};

export default nextConfig;
