/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 treats 127.0.0.1 as cross-origin for dev assets when the
  // page is opened by IP, which leaves the UI rendered but not interactive.
  allowedDevOrigins: ['127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
