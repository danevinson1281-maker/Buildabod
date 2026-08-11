/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdfkit'],
  allowedDevOrigins: ['192.168.1.188'],
}

export default nextConfig
