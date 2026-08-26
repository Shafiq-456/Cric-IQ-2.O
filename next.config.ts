import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Netlify handles its own output format — do NOT use output: "standalone" */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
