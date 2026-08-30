import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "tesseract.js", "@tesseract.js-data/eng", "@tesseract.js-data/ind"],
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
