"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { submitContactForm } from "../actions/contact";
import { createClient } from "../../lib/supabase/client";

const REASONS = [
  { value: "general", label: "Learn more about our services" },
  { value: "probono", label: "Pro bono care (careberi Cares)" },
  { value: "partner", label: "Partnership inquiry" },
  { value: "employment", label: "I'm looking for a caregiving job" },
];

const CONFIRMATIONS = {
  general:
    "Sent. A care manager will call you at the number you gave us — usually within the hour.",
  probono:
    "Sent. A care manager will review your careberi Cares request and follow up within a few days.",
  partner:
    "Sent. Our partnerships team will review this and reach out about working together.",
  employment:
    "Sent. Our hiring team will review your application and be in touch about next steps.",
};

const REQUIRED_FIELDS = ["name", "email", "phone", "town", "zip", "reason"];

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isValidNjZip(zip) {
  if (!/^[0-9]{5}$/.test(zip)) return false;
  const n = Number(zip);
  return n >= 7001 && n <= 8989;
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sentReason, setSentReason] = useState(null);
  const [errorField, setErrorField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [reason, setReason] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;

    for (const id of REQUIRED_FIELDS) {
      if (!form[id].value.trim()) {
        setErrorField(id);
        form[id].focus();
        return;
      }
    }

    const email = form.email.value.trim();
    if (!isValidEmail(email)) {
      setErrorField("email");
      form.email.focus();
      return;
    }

    const phoneDigits = form.phone.value.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setErrorField("phone");
      form.phone.focus();
      return;
    }

    const zip = form.zip.value.trim();
    if (!isValidNjZip(zip)) {
      setErrorField("zip");
      form.zip.focus();
      return;
    }

    setErrorField(null);
    setSubmitError(false);
    setSubmitting(true);

    const selectedReason = form.reason.value;
    let resumePath = null;

    const resumeFile = form.resume?.files?.[0];
    if (selectedReason === "employment" && resumeFile) {
      const supabase = createClient();
      const path = `${Date.now()}-${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile);

      if (uploadError) {
        setSubmitting(false);
        setSubmitError(true);
        return;
      }
      resumePath = path;
    }

    const result = await submitContactForm({
      name: form.name.value,
      email,
      phone: phoneDigits,
      town: form.town.value,
      zip,
      reason: selectedReason,
      story: form.story.value,
      bestTime: form.best.value,
      resumePath,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(true);
      return;
    }

    setSentReason(selectedReason);
    setSent(true);
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
              <a className="big-phone" href="tel:+12017010942">
                (201) 701-0942
              </a>
              <p style={{ fontSize: ".95rem", color: "var(--slate)" }}>
                A person answers 8am–8pm, seven days. After hours, leave a message and
                we call back in the morning.
              </p>
            </div>
          </div>

          {sent ? (
            <p id="sent" role="status" style={{ display: "block" }}>
              {CONFIRMATIONS[sentReason]}
            </p>
          ) : (
            <form id="care-form" noValidate onSubmit={handleSubmit}>
              <div className="field-row">
                <div>
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" type="text" autoComplete="name" style={errStyle("name")} />
                </div>
                <div>
                  <label htmlFor="email">Your email</label>
                  <input id="email" name="email" type="email" autoComplete="email" style={errStyle("email")} />
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label htmlFor="phone">Your phone number</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" style={errStyle("phone")} />
                </div>
                <div>
                  <label htmlFor="zip">ZIP code</label>
                  <input id="zip" name="zip" type="text" inputMode="numeric" maxLength={5} style={errStyle("zip")} />
                </div>
              </div>
              <div>
                <label htmlFor="town">Your town in New Jersey</label>
                <input id="town" name="town" type="text" style={errStyle("town")} />
              </div>
              <div>
                <label htmlFor="reason">Why are you contacting us?</label>
                <select
                  id="reason"
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={errStyle("reason")}
                >
                  <option value="" disabled>
                    Choose a reason
                  </option>
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {reason === "employment" && (
                <div>
                  <label htmlFor="resume">Resume (optional)</label>
                  <input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" />
                </div>
              )}
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
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send request"}
              </button>
              <p className="field-note">We never sell or share your information.</p>
              {submitError && (
                <p role="alert" style={{ color: "#C2372F" }}>
                  Something went wrong sending your request. Please call us instead at{" "}
                  <a href="tel:+12017010942">(201) 701-0942</a>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </Reveal>
  );
}
