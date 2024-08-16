/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.are.na", protocol: "https" }],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
