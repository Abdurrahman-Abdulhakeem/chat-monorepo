import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["@packages/shared"] = path.resolve(
      __dirname,
      "../../packages/shared/src"
    );
    return config;
  },
  transpilePackages: ["@packages/shared"],
};

export default nextConfig;
