/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.29.234", "192.168.29.234:3005", "10.0.2.2", "10.0.2.2:3005"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-501eba8c4e974d04b63a1d47ce290bde.r2.dev",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
      },
    ],
  },
};

export default nextConfig;
