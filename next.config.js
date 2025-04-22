/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      http: false,
      https: false,
      stream: false,
      zlib: false,
    };
    return config;
  },
};

module.exports = nextConfig;