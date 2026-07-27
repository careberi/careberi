import Reveal from "./Reveal";

const perks = [
  { title: "Flexible schedules", body: "Day, evening, overnight, and weekend shifts near where you live." },
  { title: "Competitive pay", body: "Weekly pay, overtime, and travel between clients accounted for." },
  { title: "Paid training", body: "Ongoing training and support, including dementia and fall-prevention care." },
  { title: "Real support", body: "A care manager who answers the phone when you need backup." },
];

export default function Jobs() {
  return (
    <Reveal className="band-tint" id="jobs">
      <div className="wrap">
        <div className="jobs-grid">
          <div>
            <p className="eyebrow">Careers</p>
            <h2>
              Caregiver jobs in <span className="hl">New Jersey</span>
            </h2>
            <p className="lede">
              careberi is hiring compassionate caregivers, Certified Home Health Aides
              (CHHAs), and companions across New Jersey. If you treat clients like
              family, we want to meet you — flexible shifts, real support, and pay that
              respects the work.
            </p>
            <div className="jobs-cta">
              <a className="btn btn-primary" href="#contact">
                Apply now
              </a>
              <a className="btn btn-ghost" href="tel:+12017010942">
                Questions? Call us
              </a>
            </div>
          </div>
          <div className="perks">
            {perks.map((p) => (
              <div className="perk" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
