/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.are.na", protocol: "https" },
      { hostname: "a.ltrbxd.com", protocol: "https" },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
