"use client";

import { useState } from "react";
import BerryMark from "./BerryMark";

const links = [
  { href: "#approach", label: "Our Approach" },
  { href: "#services", label: "Our Services" },
  { href: "#probono", label: "Pro Bono Care" },
  { href: "#jobs", label: "Jobs" },
  { href: "#partnerships", label: "Partnerships" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="bar">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <BerryMark className="mark" title="careberi non-medical home care New Jersey" />
          <span className="wordmark">
            <span className="name">
              <span className="care">care</span>
              <span className="beri">beri</span>
            </span>
            <span className="tag">Home Health &amp; Home Care</span>
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
