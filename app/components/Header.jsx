"use client";

import { useEffect, useRef, useState } from "react";
import BerryMark from "./BerryMark";

const links = [
  { href: "#approach", label: "Our Approach" },
  { href: "#services", label: "Our Services" },
  { href: "#probono", label: "Pro Bono Care" },
  { href: "#jobs", label: "Jobs" },
  { href: "#partnerships", label: "Partnerships" },
];

function textWidth(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const nameRef = useRef(null);
  const tagRef = useRef(null);

  // Track the tagline so it starts and ends flush with the wordmark.
  useEffect(() => {
    const word = nameRef.current;
    const tag = tagRef.current;
    if (!word || !tag) return;

    const fit = () => {
      tag.style.letterSpacing = "normal";
      tag.style.marginRight = "0px";

      // Range width includes the trailing letter-space, which for the wordmark is negative.
      // Strip it from both so we compare visible ink to visible ink.
      const wordLS = parseFloat(getComputedStyle(word).letterSpacing) || 0;
      const target = textWidth(word) - wordLS;
      const base = textWidth(tag);
      const n = (tag.textContent || "").trim().length;
      // Hidden below 620px, where both widths measure 0.
      if (n < 2 || !target || !base) return;

      // Spacing lands after every character, but only the n-1 gaps between the
      // first and last glyph widen the visible ink — the trailing one is cancelled below.
      const ls = (target - base) / (n - 1);
      tag.style.letterSpacing = `${ls.toFixed(3)}px`;
      tag.style.marginRight = `${(-ls).toFixed(3)}px`;
    };

    fit();
    // Poppins swaps in after first paint; the metrics change with it.
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <header>
      <div className="bar">
        <a
          className="brand"
          href="#top"
          aria-label="careberi — home health and home care"
          onClick={() => setOpen(false)}
        >
          <BerryMark className="mark" title="careberi non-medical home care New Jersey" />
          <span className="wordmark">
            <span className="name" ref={nameRef}>
              <span className="care">care</span>
              <span className="beri">beri</span>
            </span>
            <span className="tag" ref={tagRef}>
              Home Health &amp; Home Care
            </span>
          </span>
        </a>

        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <nav className={`nav${open ? " open" : ""}`} id="nav">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="cta" href="/?reason=general#contact" onClick={() => setOpen(false)}>
            Request Care
          </a>
        </nav>
      </div>
    </header>
  );
}
