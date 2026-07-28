import Reveal from "./Reveal";

const partners = [
  {
    title: "Hospitals & discharge planners",
    body: "Same-day and next-day starts to support safe discharges and reduce avoidable readmissions.",
    icon: (
      <>
        <path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6" />
        <path d="M12 3v4M10 5h4" />
      </>
    ),
  },
  {
    title: "Case managers & social workers",
    body: "Clear communication, visit notes, and a single point of contact for every shared client.",
    icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    title: "Senior living & facilities",
    body: "Supplemental one-on-one care for residents who need more support than a community provides.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M17 14c2.4 0 4 1.4 4 4" />
      </>
    ),
  },
];

export default function Partnerships() {
  return (
    <Reveal id="partnerships">
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">For referral partners</p>
          <h2>
            Partner with <span className="hl">careberi</span>
          </h2>
          <p className="lede" style={{ marginLeft: "auto", marginRight: "auto" }}>
            We work alongside New Jersey hospitals, skilled nursing facilities, case
            managers, and senior communities to get patients home safely and keep them
            there.
          </p>
        </div>
        <div className="partners">
          {partners.map((p) => (
            <div className="partner" key={p.title}>
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2F80C2"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {p.icon}
              </svg>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
        <div className="partner-cta">
          <a className="btn btn-primary" href="/?reason=partner#contact">
            Become a partner
          </a>
        </div>
      </div>
    </Reveal>
  );
}
