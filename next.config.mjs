/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows a separate build output (e.g. CI or verifying a build while `next dev` is running).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Load these as real Node packages: better-sqlite3 is native, and bundling cloudinary
  // swaps in a browser 'os' shim that corrupts its multipart uploads.
  serverExternalPackages: ['better-sqlite3', 'cloudinary'],
  turbopack: {
    rules: {
      '*.sqlite': {
        loaders: ['file-loader'],
      },
    },
  },
  // Add webpack fallback for Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // SEO and Performance optimizations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
