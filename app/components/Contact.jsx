"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import RangeSlider from "./RangeSlider";
import { submitContactForm } from "../actions/contact";
import { createClient } from "../../lib/supabase/client";

const REASONS = [
  { value: "general", label: "Learn more about our services" },
  { value: "probono", label: "Pro bono care (careberi care)" },
  { value: "partner", label: "Partnership inquiry" },
  { value: "employment", label: "I'm looking for a caregiving job" },
];

const CONFIRMATIONS = {
  general:
    "Sent. A care manager will call you at the number you gave us — usually within the hour.",
  probono:
    "Sent. A care manager will review your careberi care request and follow up within a few days.",
  partner:
    "Sent. Our partnerships team will review this and reach out about working together.",
  employment:
    "Sent. Our hiring team will review your application and be in touch about next steps.",
};

const CARE_NEEDS_OPTIONS = [
  { value: "household_tasks", label: "Household tasks", desc: "Errands, housekeeping and meal prep." },
  { value: "personal_care", label: "Personal care", desc: "Bathing, dressing and feeding." },
  { value: "companionship", label: "Companionship", desc: "Sharing hobbies and lending an ear." },
  { value: "transportation", label: "Transportation", desc: "Trips to appointments and errands." },
  { value: "specialized_care", label: "Specialized care", desc: "Intellectual disability, memory support." },
  { value: "mobility_assistance", label: "Mobility assistance", desc: "Lift, transfers, physical activity, etc." },
];

const CARE_TYPE_OPTIONS = [
  { value: "recurring", label: "Recurring" },
  { value: "one_time", label: "One-time" },
  { value: "live_in", label: "Live-in" },
];

const RECIPIENT_OPTIONS = [
  { value: "parent", label: "My parent" },
  { value: "spouse", label: "My spouse" },
  { value: "adult_child", label: "My adult child" },
  { value: "friend_relative", label: "My friend/extended relative" },
  { value: "myself", label: "Myself" },
];

const AGE_RANGES = [
  { value: "20s", label: "20's" },
  { value: "30s", label: "30's" },
  { value: "40s", label: "40's" },
  { value: "50s", label: "50's" },
  { value: "60s", label: "60's" },
  { value: "70s", label: "70's" },
  { value: "80s", label: "80's" },
  { value: "90s_plus", label: "90's+" },
];

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isValidNjZip(zip) {
  if (!/^[0-9]{5}$/.test(zip)) return false;
  const n = Number(zip);
  return n >= 7001 && n <= 8989;
}

function formatHour(h) {
  const hh = h % 24;
  const period = hh >= 12 ? "PM" : "AM";
  let hour12 = hh % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:00 ${period}`;
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  zip: "",
  reason: "",
  careNeeds: [],
  careType: "",
  startDate: "",
  endDate: "",
  timeStart: 9,
  timeEnd: 17,
  payMin: 25,
  payMax: 30,
  careRecipient: "",
  recipientGender: "female",
  recipientAgeRange: "",
  recipientNotes: "",
  caregiverPrefs: "",
  town: "",
  story: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [stepId, setStepId] = useState("intro");
  const [history, setHistory] = useState([]);
  const [errorFields, setErrorFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentReason, setSentReason] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("reason");
    if (REASONS.some((r) => r.value === requested)) {
      set("reason", requested);
    }
  }, []);

  function set(field, value) {
    setFormData((f) => ({ ...f, [field]: value }));
  }

  function toggleCareNeed(value) {
    setFormData((f) => ({
      ...f,
      careNeeds: f.careNeeds.includes(value)
        ? f.careNeeds.filter((v) => v !== value)
        : [...f.careNeeds, value],
    }));
  }

  function goNext(nextId) {
    setHistory((h) => [...h, stepId]);
    setErrorFields([]);
    setStepId(nextId);
  }

  function goBack() {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setErrorFields([]);
        setStepId(prev);
      }
      return h.slice(0, -1);
    });
  }

  function handleIntroNext() {
    const invalid = [];
    if (!formData.name.trim()) invalid.push("name");
    if (!formData.email.trim() || !isValidEmail(formData.email.trim())) invalid.push("email");
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) invalid.push("phone");
    if (!isValidNjZip(formData.zip.trim())) invalid.push("zip");
    if (!formData.reason) invalid.push("reason");

    if (invalid.length > 0) {
      setErrorFields(invalid);
      return;
    }

    if (formData.reason === "partner") goNext("partner-details");
    else if (formData.reason === "employment") goNext("employment-details");
    else goNext("care-needs");
  }

  function handleCareNeedsNext() {
    if (formData.careNeeds.length === 0) return setErrorFields(["care-needs"]);
    goNext("care-type");
  }

  function handleCareTypeNext() {
    if (!formData.careType) return setErrorFields(["care-type"]);
    goNext("schedule");
  }

  function handleScheduleNext() {
    if (!formData.startDate) return setErrorFields(["startDate"]);
    goNext(formData.reason === "general" ? "pay" : "recipient");
  }

  function handleRecipientNext() {
    const invalid = [];
    if (!formData.careRecipient) invalid.push("careRecipient");
    if (!formData.recipientAgeRange) invalid.push("recipientAgeRange");

    if (invalid.length > 0) {
      setErrorFields(invalid);
      return;
    }
    goNext("caregiver-prefs");
  }

  async function finalizeAndSubmit(extra) {
    setSubmitting(true);
    setSubmitError(false);

    let resumePath = null;
    if (formData.reason === "employment" && resumeFile) {
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

    const phoneDigits = formData.phone.replace(/\D/g, "");

    const result = await submitContactForm({
      name: formData.name,
      email: formData.email,
      phone: phoneDigits,
      zip: formData.zip,
      reason: formData.reason,
      town: formData.town || null,
      story: formData.story || null,
      resumePath,
      careNeeds: formData.careNeeds.length ? formData.careNeeds : null,
      careType: formData.careType || null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      payMin: formData.reason === "general" ? formData.payMin : null,
      payMax: formData.reason === "general" ? formData.payMax : null,
      careRecipient: formData.careRecipient || null,
      recipientGender: formData.recipientGender || null,
      recipientAgeRange: formData.recipientAgeRange || null,
      recipientNotes: formData.recipientNotes || null,
      caregiverPreferences: formData.caregiverPrefs || null,
      ...extra,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(true);
      return;
    }

    setSentReason(formData.reason);
    setSent(true);
  }

  function handlePartnerSubmit(e) {
    e.preventDefault();
    if (!formData.town.trim()) return setErrorFields(["town"]);
    finalizeAndSubmit({});
  }

  function handleEmploymentSubmit(e) {
    e.preventDefault();
    finalizeAndSubmit({});
  }

  function handleCaregiverPrefsSubmit(e) {
    e.preventDefault();
    finalizeAndSubmit({});
  }

  const errStyle = (id) => (errorFields.includes(id) ? { borderColor: "#C2372F" } : undefined);

  function StepNav({ onBack, nextLabel = "Next", showBack = true }) {
    return (
      <div className="wizard-nav">
        {showBack && (
          <button type="button" className="btn btn-ghost" onClick={onBack ?? goBack}>
            Back
          </button>
        )}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : nextLabel}
        </button>
      </div>
    );
  }

  function renderIntro() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleIntroNext();
        }}
      >
        <div className="field-row">
          <div>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => set("name", e.target.value)}
              style={errStyle("name")}
            />
          </div>
          <div>
            <label htmlFor="email">Your email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              style={errStyle("email")}
            />
          </div>
        </div>
        <div className="field-row">
          <div>
            <label htmlFor="phone">Your phone number</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => set("phone", e.target.value)}
              style={errStyle("phone")}
            />
          </div>
          <div>
            <label htmlFor="zip">ZIP code</label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={formData.zip}
              onChange={(e) => set("zip", e.target.value)}
              style={errStyle("zip")}
            />
          </div>
        </div>
        <div>
          <label htmlFor="reason">Why are you contacting us?</label>
          <select
            id="reason"
            value={formData.reason}
            onChange={(e) => set("reason", e.target.value)}
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
        <button className="btn btn-primary" type="submit">
          Next
        </button>
        <p className="field-note">We never sell or share your information.</p>
      </form>
    );
  }

  function renderCareNeeds() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleCareNeedsNext();
        }}
      >
        <h3>What kind of help are you looking for?</h3>
        <p className="wizard-sub">Choose all that apply.</p>
        <div className="choice-cards" style={errorFields.includes("care-needs") ? { outline: "2px solid #C2372F", borderRadius: 14 } : undefined}>
          {CARE_NEEDS_OPTIONS.map((opt) => {
            const selected = formData.careNeeds.includes(opt.value);
            return (
              <div
                key={opt.value}
                className={`choice-card${selected ? " selected" : ""}`}
                onClick={() => toggleCareNeed(opt.value)}
                role="checkbox"
                aria-checked={selected}
                tabIndex={0}
              >
                <span>
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </span>
                <span className="box">{selected ? "✓" : ""}</span>
              </div>
            );
          })}
        </div>
        <StepNav />
      </form>
    );
  }

  function renderCareType() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleCareTypeNext();
        }}
      >
        <h3>What type of care are you looking for?</h3>
        <div
          className="pill-group"
          style={{ marginBottom: 24, ...(errorFields.includes("care-type") ? { outline: "2px solid #C2372F", borderRadius: 999, padding: 4 } : {}) }}
        >
          {CARE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pill-btn${formData.careType === opt.value ? " selected" : ""}`}
              onClick={() => set("careType", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <StepNav />
      </form>
    );
  }

  function renderSchedule() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleScheduleNext();
        }}
      >
        <h3>When do you need care?</h3>
        <div className="field-row">
          <div>
            <label htmlFor="startDate">Estimated start date</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              style={errStyle("startDate")}
            />
          </div>
          <div>
            <label htmlFor="endDate">Estimated end date (optional)</label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>
        </div>
        <div className="wizard-field">
          <label>Time</label>
          <p className="range-slider-labels" style={{ marginTop: 0, marginBottom: 6 }}>
            <span>
              {formatHour(formData.timeStart)}–{formatHour(formData.timeEnd)}
            </span>
          </p>
          <RangeSlider
            min={0}
            max={24}
            step={1}
            valueMin={formData.timeStart}
            valueMax={formData.timeEnd}
            onChange={(lo, hi) => {
              set("timeStart", lo);
              set("timeEnd", hi);
            }}
          />
        </div>
        <StepNav />
      </form>
    );
  }

  function renderPay() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          goNext("recipient");
        }}
      >
        <h3>What would you like to pay for care?</h3>
        <p className="wizard-sub">The average range in your area is $20–$30/hr.</p>
        <div className="wizard-field">
          <p style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 4 }}>
            ${formData.payMin}–{formData.payMax} <span style={{ fontSize: ".95rem", color: "var(--slate)", fontWeight: 500 }}>/hr</span>
          </p>
          <RangeSlider
            min={20}
            max={60}
            step={1}
            valueMin={formData.payMin}
            valueMax={formData.payMax}
            onChange={(lo, hi) => {
              set("payMin", lo);
              set("payMax", hi);
            }}
          />
        </div>
        <StepNav />
      </form>
    );
  }

  function renderRecipient() {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleRecipientNext();
        }}
      >
        <h3>Share a few details about who needs care</h3>
        <div className="wizard-field">
          <label>Who needs care?</label>
          <div className="radio-list">
            {RECIPIENT_OPTIONS.map((opt) => (
              <label key={opt.value}>
                <input
                  type="radio"
                  name="careRecipient"
                  value={opt.value}
                  checked={formData.careRecipient === opt.value}
                  onChange={(e) => set("careRecipient", e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errorFields.includes("careRecipient") && (
            <p role="alert" style={{ color: "#C2372F", fontSize: ".9rem" }}>
              Please choose one.
            </p>
          )}
        </div>
        <div className="wizard-field">
          <label>Gender</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn${formData.recipientGender === "female" ? " selected" : ""}`}
              onClick={() => set("recipientGender", "female")}
            >
              Female
            </button>
            <button
              type="button"
              className={`toggle-btn${formData.recipientGender === "male" ? " selected" : ""}`}
              onClick={() => set("recipientGender", "male")}
            >
              Male
            </button>
          </div>
        </div>
        <div className="wizard-field">
          <label htmlFor="recipientAgeRange">Age</label>
          <select
            id="recipientAgeRange"
            value={formData.recipientAgeRange}
            onChange={(e) => set("recipientAgeRange", e.target.value)}
            style={errStyle("recipientAgeRange")}
          >
            <option value="" disabled>
              Choose an age range
            </option>
            {AGE_RANGES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recipientNotes">What should we know about them?</label>
          <textarea
            id="recipientNotes"
            placeholder="Do they have any underlying conditions? Are they recovering from a recent surgery? How would they structure their ideal day?"
            value={formData.recipientNotes}
            onChange={(e) => set("recipientNotes", e.target.value)}
          />
        </div>
        <StepNav />
      </form>
    );
  }

  function renderCaregiverPrefs() {
    return (
      <form noValidate onSubmit={handleCaregiverPrefsSubmit}>
        <h3>What are you looking for in a caregiver?</h3>
        <p className="wizard-sub">
          What type of personality would be a good fit? Are there any specialized skills they
          need?
        </p>
        <div>
          <textarea
            aria-label="Caregiver preferences"
            placeholder="Share details here"
            value={formData.caregiverPrefs}
            onChange={(e) => set("caregiverPrefs", e.target.value)}
          />
        </div>
        <StepNav nextLabel="Submit" />
        {submitError && (
          <p role="alert" style={{ color: "#C2372F" }}>
            Something went wrong sending your request. Please call us instead at{" "}
            <a href="tel:+12012665450">(201) 266-5450</a>.
          </p>
        )}
      </form>
    );
  }

  function renderPartnerDetails() {
    return (
      <form noValidate onSubmit={handlePartnerSubmit}>
        <h3>Tell us about your organization</h3>
        <div>
          <label htmlFor="town">Company / organization name</label>
          <input
            id="town"
            type="text"
            value={formData.town}
            onChange={(e) => set("town", e.target.value)}
            style={errStyle("town")}
          />
        </div>
        <div>
          <label htmlFor="story">What&apos;s going on?</label>
          <textarea
            id="story"
            placeholder="Tell us a bit about your organization and what a partnership could look like."
            value={formData.story}
            onChange={(e) => set("story", e.target.value)}
          />
        </div>
        <StepNav nextLabel="Submit" />
        <p className="field-note">We never sell or share your information.</p>
        {submitError && (
          <p role="alert" style={{ color: "#C2372F" }}>
            Something went wrong sending your request. Please call us instead at{" "}
            <a href="tel:+12012665450">(201) 266-5450</a>.
          </p>
        )}
      </form>
    );
  }

  function renderEmploymentDetails() {
    return (
      <form noValidate onSubmit={handleEmploymentSubmit}>
        <h3>Almost done</h3>
        <div>
          <label htmlFor="resume">Resume (optional)</label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <StepNav nextLabel="Submit" />
        <p className="field-note">We never sell or share your information.</p>
        {submitError && (
          <p role="alert" style={{ color: "#C2372F" }}>
            Something went wrong sending your request. Please call us instead at{" "}
            <a href="tel:+12012665450">(201) 266-5450</a>.
          </p>
        )}
      </form>
    );
  }

  function renderStep() {
    switch (stepId) {
      case "intro":
        return renderIntro();
      case "care-needs":
        return renderCareNeeds();
      case "care-type":
        return renderCareType();
      case "schedule":
        return renderSchedule();
      case "pay":
        return renderPay();
      case "recipient":
        return renderRecipient();
      case "caregiver-prefs":
        return renderCaregiverPrefs();
      case "partner-details":
        return renderPartnerDetails();
      case "employment-details":
        return renderEmploymentDetails();
      default:
        return renderIntro();
    }
  }

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
              <a className="big-phone" href="tel:+12012665450">
                (201) 266-5450
              </a>
              <p style={{ fontSize: ".95rem", color: "var(--slate)" }}>
                A person answers 24/7, every day of the year.
              </p>
            </div>
          </div>

          {sent ? (
            <div className="sent-wrap">
              <p id="sent" role="status" style={{ display: "block" }}>
                {CONFIRMATIONS[sentReason]}
              </p>
            </div>
          ) : (
            <div id="care-form" className="wizard-step">
              {renderStep()}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
