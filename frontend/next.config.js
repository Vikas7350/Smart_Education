const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    const srcPath = path.join(__dirname, 'src')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
    }
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, 'src'),
    ]
    return config
  },
}

module.exports = nextConfig



