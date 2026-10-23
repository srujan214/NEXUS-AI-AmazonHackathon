import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/mcp",
        destination: "http://localhost:8080/mcp",
      },
      {
        source: "/mcp/:path*",
        destination: "http://localhost:8080/mcp/:path*",
      },
    ];
  },
};

export default nextConfig;
