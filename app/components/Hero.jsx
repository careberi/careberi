export default function Hero() {
  return (
    <section className="hero" id="approach">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">Non-medical home care · New Jersey</p>
          <h1>
            In-home care that lets your loved one{" "}
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
            <a className="btn btn-ghost" href="tel:+12017010942">
              Call (201) 701-0942
            </a>
          </div>
          <ul className="assure">
            <li>Care can start in 24 hours</li>
            <li>No long-term contract</li>
            <li>Licensed, bonded, insured</li>
          </ul>
        </div>
        <div className="art-wrap">
          <svg
            className="art"
            viewBox="0 0 520 420"
            role="img"
            aria-label="Illustration of a house with lit windows and a tree beside it"
          >
            <rect width="520" height="420" rx="18" fill="#EAF3FB" />
            <circle cx="392" cy="112" r="66" fill="#C4DEF2" />
            <path d="M0 330h520v90H0z" fill="#D6E9F7" />
            <path d="M0 330c90-26 150 10 240-4s190-30 280 4v90H0z" fill="#C4DEF2" />
            <rect x="96" y="268" width="14" height="66" rx="7" fill="#7FA6C9" />
            <circle cx="103" cy="248" r="52" fill="#93CDEC" />
            <circle cx="70" cy="272" r="32" fill="#93CDEC" />
            <circle cx="136" cy="274" r="30" fill="#D6E9F7" />
            <path d="M196 210l104-76 104 76v124H196z" fill="#FFFFFF" />
            <path d="M180 214l120-88 120 88-10 14-110-80-110 80z" fill="#5AA9DE" />
            <rect x="286" y="268" width="42" height="66" rx="6" fill="#D6E9F7" />
            <circle cx="318" cy="302" r="3.5" fill="#16265C" />
            <rect x="220" y="228" width="46" height="42" rx="6" fill="#5AA9DE" />
            <rect x="348" y="228" width="46" height="42" rx="6" fill="#5AA9DE" />
            <path
              d="M243 228v42M220 249h46M371 228v42M348 249h46"
              stroke="#FFFFFF"
              strokeWidth="4"
              opacity=".85"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
