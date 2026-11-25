import type { NextConfig } from "next";

const backendUrl = (process.env.CAMPUSGPT_BACKEND_URL || "http://127.0.0.1:8001")
  .replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/campus/chat", destination: `${backendUrl}/chat` },
      { source: "/api/campus/pdf/upload", destination: `${backendUrl}/pdf/upload` },
      { source: "/api/campus/pdf/notes", destination: `${backendUrl}/document/notes` },
      {
        source: "/api/campus/memory/clear/:id",
        destination: `${backendUrl}/memory/clear/:id`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
    proxyTimeout: 180000,
    proxyClientMaxBodySize: "11mb",
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
