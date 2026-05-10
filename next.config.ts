import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

function getLanIpv4Hosts(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((networkInterface) => networkInterface ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLanIpv4Hosts(),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: {
    unoptimized: true
  },
  output: "export",
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: true,
  trailingSlash: true
};

export default nextConfig;
