import Reveal from "./Reveal";

const faqs = [
  {
    q: "What does it cost?",
    a: "Hourly care runs $32–$38 an hour depending on the level of help and the time of day, with a 4-hour minimum per visit. Overnight and live-in care are billed at a flat daily rate. You'll have the exact weekly number in writing before you commit to anything.",
  },
  {
    q: "How fast can you start?",
    a: "Usually within 48 hours, and same-day for hospital discharges when we have coverage in your area. Call — even late — and we'll tell you honestly what we can staff.",
  },
  {
    q: "Do you offer free or reduced-cost care?",
    a: "Yes. Through careberi Cares, our pro bono program, we set aside free caregiving hours each month for New Jersey seniors and adults with disabilities in financial hardship who don't qualify for other help. Anyone can apply or nominate someone — a family member, a social worker, or the person themselves.",
  },
  {
    q: "My parent says they don't need help. Now what?",
    a: "Most parents say that. It usually goes better when the first visit is framed around something specific and non-personal — meals, driving, housekeeping — rather than \"you need a caregiver.\" We do this every week and we're happy to help you plan the conversation before anyone shows up.",
  },
  {
    q: "Who are the caregivers?",
    a: "Employees, not contractors — which means they're covered by our liability and workers' comp insurance, not your family's homeowners policy. Every caregiver clears a national background check, a driving record check, and reference calls, and completes ongoing training including dementia care.",
  },
  {
    q: "Do you take insurance or Medicare?",
    a: "Medicare doesn't pay for non-medical home care. Most families pay privately. We do bill most long-term care insurance policies directly and can help you file the claim — bring the policy to the home visit and we'll read it with you.",
  },
  {
    q: "What if we need to change or stop?",
    a: "Give us 24 hours' notice to change or cancel a shift. There's no long-term contract and no cancellation fee. Care that goes up after a hospital stay and back down as your loved one recovers is normal — we expect it.",
  },
  {
    q: "I live out of state. Can I still manage this?",
    a: "About a third of the families we work with are long-distance. You get visit notes after each shift, a direct line to the care manager, and a call from us if anything changes — a fall, a refused meal, a bad week.",
  },
];

export default function Faq() {
  return (
    <Reveal className="band-tint">
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">Straight answers</p>
          <h2>
            Questions families <span className="hl-leaf">ask us</span>
          </h2>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details className="q" key={f.q}>
              <summary>{f.q}</summary>
              <div className="a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
