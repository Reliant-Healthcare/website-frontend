import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  async redirects() {
    return [
      {
        source: "/services/home-health-aide",
        destination: "/services/personal-care",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
