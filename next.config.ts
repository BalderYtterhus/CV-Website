import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverActions: {
    bodySizeLimit: "10mb",
  },
};

export default nextConfig;
