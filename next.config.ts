import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "upload-static.hoyoverse.com", // 추가된 호스트
      "fastcdn.hoyoverse.com",
      "webstatic.hoyoverse.com",
      "act-webstatic.hoyoverse.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastcdn.hoyoverse.com",
        port: "",
        pathname: "/static-resource-v2/**",
      },
      {
        protocol: "https",
        hostname: "zenless.hoyoverse.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "webstatic.hoyoverse.com",
        port: "",
        pathname: "/upload/static-resource/**",
      },
      {
        protocol: "https",
        hostname: "upload-static.hoyoverse.com",
        port: "",
        pathname: "/event/**",
      },
    ],
  },
};

export default nextConfig;
