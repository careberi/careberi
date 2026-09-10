const steps = [
  {
    n: "01",
    title: "A home visit",
    desc: "We come to you to understand what help is needed.",
  },
  {
    n: "02",
    title: "A written care plan",
    desc: "Hours, tasks, and who is coming — on paper, and yours to change.",
  },
  {
    n: "03",
    title: "Care begins",
    desc: "A few hours a week or 24-hour care. No long-term contract.",
  },
];

export default function Hero() {
  return (
    <section className="hero" id="approach">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Non-medical home care · New Jersey</p>
          <h1>
            In-home care that lets you or your loved one{" "}
            <span className="hl">stay home in New Jersey.</span>
          </h1>
          <p className="lede">
            careberi provides non-medical home care across New Jersey for seniors and
            adults with disabilities. Trained, background-checked caregivers help with
            bathing, meals, medication reminders, and companionship — a few hours a
            week, or around the clock. You get a written care plan, one phone number,
            and someone who answers it.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/?reason=general#contact">
              Get started
            </a>
            <a className="btn btn-ghost" href="tel:+12012665450">
              Call 201-266-5450
            </a>
          </div>
          <ul className="assure">
            <li>No long-term contract</li>
          </ul>
        </div>

        <div className="hero-steps">
          <p className="hero-steps-label">How care starts</p>
          <ol className="hero-steps-list">
            {steps.map((s) => (
              <li className="hero-step" key={s.n}>
                <span className="hero-step-num" aria-hidden="true">
                  {s.n}
                </span>
                <div>
                  <div className="hero-step-title">{s.title}</div>
                  <p className="hero-step-desc">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
