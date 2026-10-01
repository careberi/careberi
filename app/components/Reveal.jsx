"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({ as = "section", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Tells the gate script in layout.jsx the app loaded, so it keeps sections hidden until scrolled to.
    window.__revealReady = true;
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      // Fire as a section's top edge clears the bottom of the screen. A visibility ratio
      // left tall sections (the FAQ on a phone) blank until well past their top.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} className={`${className} reveal${shown ? " in" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}
