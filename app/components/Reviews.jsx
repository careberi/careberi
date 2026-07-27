"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const reviews = [
  {
    initial: "D",
    bg: "#D6E9F7",
    fg: "#16265C",
    name: "Denise M.",
    when: "2 weeks ago",
    text: "[Replace with a real Google review.] My mother was discharged on a Friday afternoon and I had no idea what to do. Someone was at her house Saturday morning. Three months later the same caregiver is still with her and Mom asks about her on her days off.",
  },
  {
    initial: "R",
    bg: "#E4EFF8",
    fg: "#16265C",
    name: "Robert T.",
    when: "1 month ago",
    text: "[Replace with a real Google review.] I live four states away and was terrified of exactly this situation. I get a note after every visit. When Dad skipped two meals in a row, they called me before I had to find out the hard way.",
  },
  {
    initial: "A",
    bg: "#F4F8FC",
    fg: "#16265C",
    name: "Angela P.",
    when: "1 month ago",
    text: "[Replace with a real Google review.] My father refused help for two years. They suggested starting with rides to his appointments instead of calling it care. He didn't argue. Now she cooks for him three days a week.",
  },
  {
    initial: "M",
    bg: "#EEF4FB",
    fg: "#16265C",
    name: "Maria S.",
    when: "2 months ago",
    text: "[Replace with a real Google review.] I hadn't slept through the night in a year. We started with two overnights a week. That's it — that's the whole review. I sleep now and my mother is still in her own house.",
  },
];

function Stars() {
  return (
    <span className="stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="#2F80C2">
          <path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7-6.2-3.5L5.8 21l1.4-7L2 9.4l7-.8z" />
        </svg>
      ))}
    </span>
  );
}

function GoogleG() {
  return (
    <svg className="g" viewBox="0 0 48 48" aria-label="Google review">
      <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.1h12c-.2 1.9-1.5 4.7-4.4 6.6l6.7 5.2C42.2 35.6 45 30.3 45 24z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8.1 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.5 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.9l7.1-5.5z" />
      <path fill="#EA4335" d="M24 10.5c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.3 29.9 2 24 2 15.4 2 8.1 6.9 4.4 14.1l7.1 5.5C13.3 14.3 18.2 10.5 24 10.5z" />
    </svg>
  );
}

function ReviewCard({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`review${open ? " open" : ""}`}>
      <div className="rev-head">
        <span className="avatar" style={{ background: r.bg, color: r.fg }}>
          {r.initial}
        </span>
        <span>
          <span className="rev-name">{r.name}</span>
          <br />
          <span className="rev-when">{r.when}</span>
        </span>
        <GoogleG />
      </div>
      <Stars />
      <p className="rev-text">{r.text}</p>
      <button className="more" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Show less" : "Read more"}
      </button>
    </article>
  );
}

export default function Reviews() {
  return (
    <Reveal id="reviews" className="band-warm">
      <div className="wrap">
        <div className="section-head center">
          <p className="eyebrow">Reviews</p>
          <h2>
            What <span className="hl">families</span> say
          </h2>
        </div>

        <div className="rev-top">
          <div className="rev-score">
            <span className="num">4.9</span>
            <Stars />
            <span className="sub">32 Google reviews</span>
          </div>
          <a className="btn btn-ghost" href="#" rel="noopener">
            Read all on Google
          </a>
        </div>

        <div className="reviews">
          {reviews.map((r) => (
            <ReviewCard key={r.name} r={r} />
          ))}
        </div>

        <div className="rev-foot">
          <p style={{ color: "var(--slate)", fontSize: ".98rem", marginBottom: 14 }}>
            Worked with us? A few sentences helps the next family decide.
          </p>
          <a className="btn btn-primary" href="#" rel="noopener">
            Leave a review on Google
          </a>
        </div>
      </div>
    </Reveal>
  );
}
