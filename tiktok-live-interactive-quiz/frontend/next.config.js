/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.1.2',  // LAN IP
    '*.local'
  ]
};

module.exports = nextConfig;
