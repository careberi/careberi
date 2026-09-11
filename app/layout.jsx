import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { services } from "./components/Services";
import { SITE_URL } from "./lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Non-Medical Home Care in New Jersey | careberi";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description:
    "Non-medical home care across New Jersey for seniors and adults with disabilities. A home visit, a written care plan, no long-term contract. Call 201-266-5450.",
  keywords: [
    "home care New Jersey",
    "non-medical home care NJ",
    "senior home care",
    "in-home caregivers",
    "disability home care",
    "elderly care New Jersey",
    "companion care",
    "personal care assistant",
    "respite care NJ",
    "pro bono home care",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title,
    description:
      "Non-medical home care for New Jersey seniors and adults with disabilities. A home visit, a written care plan, and no long-term contract.",
    url: `${SITE_URL}/`,
    siteName: "careberi",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

const ORG_ID = `${SITE_URL}/#organization`;
const NEW_JERSEY = { "@type": "State", name: "New Jersey" };

const jsonLd = {
  "@context": "https://schema.org",
  // schema.org has no non-medical home care type, so plain LocalBusiness plus Service entries.
  "@type": "LocalBusiness",
  "@id": ORG_ID,
  name: "careberi",
  description:
    "Non-medical home care agency serving New Jersey seniors and adults with disabilities with personal care, companionship, meals and housekeeping, medication reminders, rides and errands, memory care, 24-hour care, respite care, and a pro bono care program for families in financial hardship.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  telephone: "+1-201-266-5450",
  email: "care@careberi.com",
  areaServed: NEW_JERSEY,
  address: { "@type": "PostalAddress", addressRegion: "NJ", addressCountry: "US" },
  priceRange: "$36–$50 per hour",
  // Phones are answered 24/7; 00:00–23:59 is how Google expects round-the-clock hours.
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  knowsAbout: [
    "non-medical home care",
    "senior care",
    "disability care",
    "respite care",
    "companion care",
    "personal care assistance",
    "pro bono home care",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Non-medical home care services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.body,
        serviceType: "Non-medical home care",
        areaServed: NEW_JERSEY,
        provider: { "@id": ORG_ID },
      },
    })),
  },
};

// Sections fade in on scroll, so they start hidden. Hide them only when this script runs,
// and un-hide them after 4s if the app bundle never loads, so the page is never left blank.
const REVEAL_GATE =
  'document.documentElement.classList.add("js");' +
  'setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove("js")},4000);';

export default function RootLayout({ children }) {
  return (
    // The gate script adds a class to <html> before hydration.
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_GATE }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
