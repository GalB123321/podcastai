/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Firebase module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google profile photos
      'platform-lookaside.fbsbx.com', // Facebook profile photos
      'firebasestorage.googleapis.com', // Firebase Storage
    ],
  },
};

module.exports = nextConfig; 