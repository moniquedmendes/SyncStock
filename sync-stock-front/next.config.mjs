import path from "node:path"
import { fileURLToPath } from "node:url"

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const apiOrigin =
  process.env.SYNC_STOCK_API_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "http://localhost:5019" : undefined)

const nextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!apiOrigin) {
      return []
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
