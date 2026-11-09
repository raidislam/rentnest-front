import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /dashboard is handled by proxy.ts: signed-in users go to their role's
  // dashboard, everyone else to /auth/login.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
