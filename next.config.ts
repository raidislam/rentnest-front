import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Each role has its own dashboard. Until real sessions exist, /dashboard sends
  // visitors to log in, which routes them to the right one.
  async redirects() {
    return [{ source: "/dashboard", destination: "/auth/login", permanent: false }];
  },
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
