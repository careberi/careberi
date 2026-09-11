/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // no-op: forces a fresh Hostinger build/deploy

  // Serve one host so search engines index a single copy of the site.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "careberi.com" }],
        destination: "https://www.careberi.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
