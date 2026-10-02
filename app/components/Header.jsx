"use client";

import { useEffect, useRef, useState } from "react";
import BerryMark from "./BerryMark";
import UtilityBar from "./UtilityBar";

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
  const [active, setActive] = useState(null);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
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

  // The open menu dismisses the way a native one does: Escape, or a tap anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  // Mark the link for the section crossing the middle of the screen, so the bar says where you are.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = links.map((l) => document.querySelector(l.href)).filter(Boolean);
    const inView = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => inView.set(e.target, e.isIntersecting));
        const current = sections.find((s) => inView.get(s));
        setActive(current ? `#${current.id}` : null);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header ref={headerRef}>
      {/* Inside the landmark so no page content sits outside one. */}
      <UtilityBar />
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

        <div className="bar-actions">
          <a className="nav-call" href="tel:+12012665450" aria-label="Call careberi at 201-266-5450">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </a>
          <button
            ref={toggleRef}
            className="nav-toggle"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path className="l1" d="M4 7h16" />
              <path className="l2" d="M4 12h16" />
              <path className="l3" d="M4 17h16" />
            </svg>
          </button>
        </div>

        <nav className={`nav${open ? " open" : ""}`} id="nav" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
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
