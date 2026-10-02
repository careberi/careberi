import BerryMark from "./BerryMark";
import { GOOGLE_REVIEW_URL } from "../lib/site";

const serviceLinks = [
  { href: "#approach", label: "Our Approach" },
  { href: "#services", label: "Our Services" },
  { href: "#probono", label: "Pro Bono Care" },
];

const companyLinks = [
  { href: "#jobs", label: "Jobs" },
  { href: "#partnerships", label: "Partnerships" },
];

export default function Footer() {
  return (
    <footer>
      <div className="foot">
        <div className="foot-brand">
          <span className="foot-logo">
            <BerryMark title="careberi" />
            <strong>
              care<span>beri</span>
            </strong>
          </span>
          <p>
            Non-medical home care for seniors and adults with disabilities across New
            Jersey. Home health services are planned for the future.
          </p>
          <p style={{ margin: 0 }}>Pre-licensed, bonded, and insured</p>
        </div>

        <div className="foot-col">
          <p className="foot-heading">Contact</p>
          <a href="tel:+12012665450">201-266-5450</a>
          <a href="mailto:care@careberi.com">care@careberi.com</a>
          <span>Open 24/7</span>
        </div>

        <nav className="foot-col" aria-label="Services">
          <p className="foot-heading">Services</p>
          {serviceLinks.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <nav className="foot-col" aria-label="Company">
          <p className="foot-heading">Company</p>
          {companyLinks.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
          <a
            href="https://carebericp.caresmartz360.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Family Portal
          </a>
        </nav>

        {/* Guarded so a blank constant can never ship a dead href="#" again. */}
        {GOOGLE_REVIEW_URL && (
          <div className="foot-col">
            <p className="foot-heading">Worked with us?</p>
            <a
              className="btn btn-ghost"
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Leave a review on Google
            </a>
          </div>
        )}
      </div>

      <div className="foot-base">
        <p>© {new Date().getFullYear()} careberi</p>
        <a href="#top">
          Back to top
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
