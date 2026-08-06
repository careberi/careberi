import Reveal from "./Reveal";

const paths = [
  {
    q: "I'm starting to worry about Mom.",
    a: "Walk the house with you and name the risks out loud: the stairs, the stove, the pill organizer nobody's refilling. Then start small — four hours, two mornings a week. Parents accept help more easily before a crisis forces it.",
  },
  {
    q: "Dad's coming home from the hospital.",
    a: "Get a caregiver in the house the day he's discharged. The first two weeks home are when falls and readmissions happen. We cover meals, bathing, medication reminders, and rides to follow-ups, then step down as he steadies.",
  },
  {
    q: "I've been doing this by myself for a while.",
    a: "Give you a night off this week. Respite care can be one afternoon, a weekend, or a standing night so you can sleep. You don't have to hand over everything — hand off the shifts that are wearing you down and keep the rest.",
  },
];

export default function Approach() {
  return (
    <Reveal id="start" className="band-tint">
      <div className="wrap">
        <p className="eyebrow">Start here</p>
        <h2>
          Where are you <span className="hl-leaf">right now?</span>
        </h2>
        <p className="lede">
          Families call us at three different moments. Pick the one that sounds like
          yours and we&apos;ll tell you what to do first — even if you never hire us.
        </p>

        <div className="paths">
          {paths.map((p) => (
            <details className="path" key={p.q}>
              <summary>{p.q}</summary>
              <div className="body">
                <p>
                  <strong>What we&apos;d do first</strong>
                </p>
                <p>{p.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
