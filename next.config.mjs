/** @type {import('next').NextConfig} */

// HSTS deliberately omits `preload`: preload lists are effectively permanent, and
// committing to one while the host's TLS handshakes are intermittently failing
// would lock people out. Add `preload` once that is resolved.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

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

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The default for a static page is s-maxage=31536000 — a year of shared
        // cache, which is why copy edits can look like they never deployed.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
