import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3333",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.hmnfrutas.com.br",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;