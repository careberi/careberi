import Reveal from "./Reveal";

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function ProBono() {
  return (
    <Reveal className="probono" id="probono">
      <div className="wrap probono-grid">
        <div>
          <p className="eyebrow">careberi care · Pro bono program</p>
          <h2>
            Free home care for New Jersey families in{" "}
            <span className="hl">financial hardship.</span>
          </h2>
          <p className="lede">
            Cost should not decide whether someone gets to stay home. Through
            careberi care, we set aside a number of fully pro bono caregiving hours
            each month for seniors and adults with disabilities who can&apos;t afford
            care and don&apos;t qualify for other help.
          </p>
          <ul className="pb-points">
            <li>
              <Check />
              <span>
                No cost to the family — the same trained, background-checked
                caregivers as our paid care.
              </span>
            </li>
            <li>
              <Check />
              <span>
                For NJ seniors and adults with disabilities facing a genuine
                financial gap.
              </span>
            </li>
            <li>
              <Check />
              <span>
                Anyone can nominate — a family member, a social worker, a neighbor,
                or the person themselves.
              </span>
            </li>
          </ul>
        </div>

        <div className="pb-card">
          <h3>Apply or nominate someone</h3>
          <p>
            Tell us a little about the person and their situation. A care manager
            reviews every request personally and follows up within a few days —
            confidentially, and with no obligation.
          </p>
          <div className="pb-actions">
            <a className="btn btn-primary" href="/?reason=probono#contact">
              Apply for careberi care
            </a>
            <a className="btn btn-ghost" href="/?reason=probono#contact">
              Nominate a neighbor
            </a>
          </div>
          <p style={{ fontSize: ".88rem", color: "var(--muted)", margin: "16px 0 0" }}>
            Want to help fund free care hours? Ask us about sponsoring careberi care.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
