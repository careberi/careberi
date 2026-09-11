import { SITE_URL } from "./lib/site";

// Bump when the homepage content changes meaningfully.
const LAST_UPDATED = "2026-09-11";

export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
