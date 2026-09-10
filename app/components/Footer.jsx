import BerryMark from "./BerryMark";

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
          <span style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <BerryMark style={{ width: 26, height: "auto", flex: "none" }} title="careberi" />
            <strong
              style={{
                color: "#EAF3FB",
                fontSize: "1.15rem",
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 600,
              }}
            >
              care<span style={{ color: "#5AA9DE" }}>beri</span>
            </strong>
          </span>
          <p style={{ margin: "0 0 8px" }}>
            Non-medical home care for seniors and adults with disabilities across New
            Jersey.
          </p>
          <p style={{ margin: 0 }}>Licensed, bonded, and insured · NJ HCSA #0000000</p>
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
          <a href="#">Privacy</a>
        </nav>

        <div className="foot-col">
          <p className="foot-heading">Worked with us?</p>
          <a className="btn btn-ghost" href="#" rel="noopener">
            Leave a review on Google
          </a>
        </div>
      </div>
    </footer>
  );
}
