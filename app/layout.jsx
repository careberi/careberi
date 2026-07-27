import { Poppins, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata = {
  metadataBase: new URL("https://www.careberi.com"),
  title: "Non-Medical Home Care in New Jersey | careberi — Senior & Disability Care",
  description:
    "careberi provides non-medical home care in New Jersey for seniors and people with disabilities. Trained, background-checked caregivers help with bathing, meals, medication reminders, and companionship at home. Free in-home assessment — call (555) 000-1234.",
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
    title: "Non-Medical Home Care in New Jersey | careberi",
    description:
      "Compassionate, non-medical home care for New Jersey seniors and people with disabilities. Free in-home assessment.",
    url: "https://www.careberi.com/",
    siteName: "careberi",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 300'%3E%3Ccircle cx='117' cy='120' r='24' fill='%235AA9DE'/%3E%3Ccircle cx='165' cy='120' r='24' fill='%232A5D9F'/%3E%3Ccircle cx='93' cy='158' r='24' fill='%232F80C2'/%3E%3Ccircle cx='141' cy='158' r='24' fill='%2316265C'/%3E%3Ccircle cx='189' cy='158' r='24' fill='%235AA9DE'/%3E%3Ccircle cx='93' cy='196' r='24' fill='%232A5D9F'/%3E%3Ccircle cx='141' cy='196' r='24' fill='%232F80C2'/%3E%3Ccircle cx='189' cy='196' r='24' fill='%2316265C'/%3E%3Ccircle cx='117' cy='234' r='24' fill='%2316265C'/%3E%3Ccircle cx='165' cy='234' r='24' fill='%232F80C2'/%3E%3Ccircle cx='141' cy='272' r='24' fill='%232A5D9F'/%3E%3C/svg%3E",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  additionalType: "https://schema.org/MedicalBusiness",
  name: "careberi",
  description:
    "Non-medical home care agency serving New Jersey seniors and people with disabilities with personal care, companionship, meal preparation, medication reminders, transportation, respite care, and a pro bono care program for families in financial hardship.",
  url: "https://www.careberi.com/",
  telephone: "+1-555-000-1234",
  email: "care@careberi.com",
  areaServed: { "@type": "State", name: "New Jersey" },
  address: { "@type": "PostalAddress", addressRegion: "NJ", addressCountry: "US" },
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "20:00",
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
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "32" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
