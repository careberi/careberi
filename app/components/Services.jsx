import Reveal from "./Reveal";

const services = [
  {
    title: "Personal care",
    body: "Bathing, dressing, grooming, and getting safely to the bathroom — with dignity intact.",
    icon: <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" />,
  },
  {
    title: "Meals & housekeeping",
    body: "Cooking food they'll actually eat, laundry, dishes, and keeping the floors clear.",
    icon: <path d="M5 3v8a3 3 0 003 3v7M8 3v6M11 3v6M17 3c-1.5 3-2 5-2 8h4c0-3-.5-5-2-8zM17 11v10" />,
  },
  {
    title: "Medication reminders",
    body: "The right pills at the right hour, with a note to you if something's off.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: "Rides & errands",
    body: "Doctor's appointments, the pharmacy, church, the grocery store, a haircut.",
    icon: <path d="M3 17h2l2-6h10l2 6h2M6 17a2 2 0 104 0 2 2 0 10-4 0M14 17a2 2 0 104 0 2 2 0 10-4 0M8 11V7h8v4" />,
  },
  {
    title: "Companionship",
    body: "Someone to talk to, play cards with, and notice when the day went sideways.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M17 14c2.4 0 4 1.4 4 4" />
      </>
    ),
  },
  {
    title: "Memory care",
    body: "Caregivers trained for dementia — routines, redirection, and patience on hard afternoons.",
    icon: (
      <>
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM9 10a3 3 0 016 0c0 2-3 2.2-3 4" />
        <circle cx="12" cy="17.5" r=".7" fill="#2F80C2" stroke="none" />
      </>
    ),
  },
  {
    title: "Overnight & 24-hour",
    body: "Awake overnight care when nights have become the hardest part.",
    icon: <path d="M3 12a9 9 0 0118 0M3 12v4a2 2 0 002 2h1v-6H5a2 2 0 00-2 2zM21 12v4a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z" />,
  },
  {
    title: "Respite for family",
    body: "Cover for you — an afternoon, a weekend, or the week you're finally taking a vacation.",
    icon: (
      <>
        <path d="M4 5h16v11H8l-4 4z" />
        <path d="M9 10h6" />
      </>
    ),
  },
];

export default function Services() {
  return (
    <Reveal id="services">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Our home care services</p>
          <h2>
            Non-medical home care services in <span className="hl">New Jersey</span>
          </h2>
          <p className="lede">
            Personal care, companionship, and support for seniors and adults with
            disabilities — built around what your loved one actually needs. Mix and
            match; the plan changes as they do.
          </p>
        </div>
        <div className="services">
          {services.map((s) => (
            <article className="svc" key={s.title}>
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2F80C2"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {s.icon}
              </svg>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
