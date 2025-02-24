import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastcdn.hoyoverse.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zenless.hoyoverse.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
