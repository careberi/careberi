import Reveal from "./Reveal";

const steps = [
  {
    when: "15 minutes",
    title: "Tell us what's going on",
    body: "Call or send the form. A care manager — not a call center — asks about your loved one and answers what you ask.",
  },
  {
    when: "Free · about an hour",
    title: "We visit the home",
    body: "We meet your loved one where they live, look at the real risks, and listen to what they want. You're welcome to join by phone.",
  },
  {
    when: "Within 24 hours",
    title: "You get a plan and a price",
    body: "A written schedule, the tasks each shift covers, the hourly rate, and the weekly total. No surprises later.",
  },
  {
    when: "Before day one",
    title: "You meet the caregiver",
    body: "You approve who walks through the door. If the fit isn't right, say so and we'll send someone else.",
  },
];

export default function Steps() {
  return (
    <Reveal>
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2>
            Four steps, and you&apos;ll know{" "}
            <span className="hl">exactly what care costs</span>
          </h2>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.title}>
              <p className="when">{s.when}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
