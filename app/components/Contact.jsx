"use client";

import { useState } from "react";
import Reveal from "./Reveal";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [errorField, setErrorField] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    for (const id of ["name", "phone", "town"]) {
      if (!form[id].value.trim()) {
        setErrorField(id);
        form[id].focus();
        return;
      }
    }
    setErrorField(null);
    setSent(true);
    form.reset();
  }

  const errStyle = (id) =>
    errorField === id ? { borderColor: "#C2372F" } : undefined;

  return (
    <Reveal id="contact">
      <div className="wrap">
        <div className="contact-grid">
          <div>
            <p className="eyebrow">Free home visit</p>
            <h2>
              Tell us about <span className="hl">your loved one</span>
            </h2>
            <p className="lede">
              Send this and a care manager calls you back the same day — usually within
              an hour. No obligation, and no one will show up at the door unannounced.
            </p>
            <div className="callout">
              <p style={{ marginBottom: 2 }}>
                <strong>Would rather just talk?</strong>
              </p>
              <a className="big-phone" href="tel:+15550001234">
                (555) 000-1234
              </a>
              <p style={{ fontSize: ".95rem", color: "var(--slate)" }}>
                A person answers 8am–8pm, seven days. After hours, leave a message and
                we call back in the morning.
              </p>
            </div>
          </div>

          <form id="care-form" noValidate onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" type="text" autoComplete="name" style={errStyle("name")} />
            </div>
            <div>
              <label htmlFor="phone">Your phone number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" style={errStyle("phone")} />
            </div>
            <div>
              <label htmlFor="town">Your town or ZIP in New Jersey</label>
              <input id="town" name="town" type="text" style={errStyle("town")} />
            </div>
            <div>
              <label htmlFor="story">What&apos;s going on?</label>
              <textarea
                id="story"
                name="story"
                placeholder="A few sentences is plenty. Example: Mom is 84, lives alone in Bergen County, fell in June, and isn't eating much."
              />
            </div>
            <div>
              <label htmlFor="best">Best time to reach you</label>
              <input id="best" name="best" type="text" placeholder="Weekday mornings, after 6pm, anytime…" />
            </div>
            <button className="btn btn-primary" type="submit">
              Send request
            </button>
            <p className="field-note">We never sell or share your information.</p>
            {sent && (
              <p id="sent" role="status" style={{ display: "block" }}>
                Sent. A care manager will call you at the number you gave us — usually
                within the hour.
              </p>
            )}
          </form>
        </div>
      </div>
    </Reveal>
  );
}
