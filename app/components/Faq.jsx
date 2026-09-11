import Reveal from "./Reveal";

// Answers name careberi, the place, and the numbers so each one still makes sense
// when a search or AI engine quotes it without the rest of the page.
const faqs = [
  {
    q: "How much does home care cost?",
    a: "Non-medical home care from careberi costs $36–$50 an hour in New Jersey, depending on the level of help and the time of day, with no minimum per visit. For example, 20 hours a week comes to about $720–$1,000. You'll have the exact weekly number in writing before you commit to anything. Rates as of September 2026.",
  },
  {
    q: "Do you provide home health care?",
    a: "Not yet. careberi provides non-medical home care today: help with bathing, dressing, meals, medication reminders, companionship, and getting around. Home health care is skilled medical care, like nursing or physical therapy, ordered by a doctor, and it's something we plan to offer in the future. If your loved one needs skilled care at home now, their doctor can arrange it through a home health agency, and careberi can provide the non-medical help alongside it.",
  },
  {
    q: "How fast can you start?",
    a: "We aim to start within 48 hours, and same-day for hospital discharges when we have a caregiver available in your area. Call — even late — and we'll tell you honestly what we can staff.",
  },
  {
    q: "Do you offer free or reduced-cost care?",
    a: "Yes. Through careberi care, our pro bono program, we set aside free caregiving hours each month for New Jersey seniors and adults with disabilities in financial hardship who don't qualify for other help. Anyone can apply or nominate someone — a family member, a social worker, or the person themselves.",
  },
  {
    q: "My parent says they don't need help. Now what?",
    a: "Most parents say that. It usually goes better when the first visit is framed around something specific and non-personal — meals, driving, housekeeping — rather than \"you need a caregiver.\" We're happy to help you plan the conversation before anyone shows up.",
  },
  {
    q: "Who are the caregivers?",
    a: "Employees, not contractors — which means they're covered by our liability and workers' comp insurance, not your family's homeowners policy. Every caregiver clears a national background check, a driving record check, and reference calls, and completes ongoing training including dementia care.",
  },
  {
    q: "Do you take insurance or Medicare?",
    a: "Medicare doesn't pay for non-medical home care, so most families pay privately. If your loved one has long-term care insurance, bring the policy to the home visit — we'll read it with you and help you file the claim. If cost is what's standing in the way, ask about careberi care, our pro bono program.",
  },
  {
    q: "What is respite care?",
    a: "Respite care is short-term care that gives a family caregiver a break. With careberi, respite can be one afternoon, a weekend, a standing night each week, or the week you're finally taking a vacation — with the same trained, background-checked caregivers as ongoing care.",
  },
  {
    q: "What if we need to change or stop?",
    a: "Give us 24 hours' notice to change or cancel a shift. There's no long-term contract and no cancellation fee. Care that goes up after a hospital stay and back down as your loved one recovers is normal — we expect it.",
  },
  {
    q: "I live out of state. Can I still manage this?",
    a: "Yes. Families who live out of state get visit notes after each shift, a direct line to the care manager, and a call from us if anything changes — a fall, a refused meal, a bad week.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Faq() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
    </>
  );
}
