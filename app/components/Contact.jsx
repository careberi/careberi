"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import RangeSlider from "./RangeSlider";
import { submitContactForm } from "../actions/contact";

const REASONS = [
  { value: "general", label: "Learn more about our services" },
  { value: "probono", label: "Pro bono care (careberi care)" },
  { value: "partner", label: "Partnership inquiry" },
];

const CONFIRMATIONS = {
  general:
    "Sent. A care manager will call you at the number you gave us — we aim to call within the hour.",
  probono:
    "Sent. A care manager will review your careberi care request and follow up within a few days.",
  partner:
    "Sent. Our partnerships team will review this and reach out about working together.",
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

function isValidZip(zip) {
  return /^[0-9]{5}$/.test(zip);
}

function isNjZip(zip) {
  if (!isValidZip(zip)) return false;
  const n = Number(zip);
  return n >= 7001 && n <= 8989;
}

// Care is only delivered in New Jersey, so care requests must be in-state.
// Partners and job applicants may be anywhere.
function zipRequiresNj(reason) {
  return reason === "general" || reason === "probono";
}

function zipError(zip, reason) {
  if (!zip) return "Please enter your ZIP code.";
  if (!isValidZip(zip)) return "Enter a 5-digit ZIP code.";
  if (zipRequiresNj(reason) && !isNjZip(zip)) {
    return "We provide care in New Jersey only. Enter an NJ ZIP code, or choose a different reason above.";
  }
  return null;
}

function formatHour(h) {
  const hh = h % 24;
  const period = hh >= 12 ? "PM" : "AM";
  let hour12 = hh % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:00 ${period}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Guards against transient network blips (e.g. a brief connectivity hiccup
// between the host and Supabase) so a real visitor's submission doesn't get
// lost to a one-off failure. Retries silently before surfacing any error.
async function submitContactFormWithRetry(payload, attempts = 3) {
  let result;
  for (let i = 0; i < attempts; i++) {
    result = await submitContactForm(payload);
    if (result.success) return result;
    if (i < attempts - 1) await sleep(500 * (i + 1));
  }
  return result;
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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentReason, setSentReason] = useState(null);

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
    setErrors({});
    setStepId(nextId);
  }

  function goBack() {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setErrors({});
        setStepId(prev);
      }
      return h.slice(0, -1);
    });
  }

  function handleIntroNext() {
    const found = {};
    if (!formData.name.trim()) found.name = "Please enter your name.";
    if (!formData.email.trim()) found.email = "Please enter your email address.";
    else if (!isValidEmail(formData.email.trim()))
      found.email = "That doesn't look like a valid email address.";

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) found.phone = "Please enter your phone number.";
    else if (phoneDigits.length !== 10)
      found.phone = "Enter a 10-digit phone number, including the area code.";

    const zipMsg = zipError(formData.zip.trim(), formData.reason);
    if (zipMsg) found.zip = zipMsg;

    if (!formData.reason) found.reason = "Please choose a reason so we can route your request.";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    if (formData.reason === "partner") goNext("partner-details");
    else goNext("care-needs");
  }

  function handleCareNeedsNext() {
    if (formData.careNeeds.length === 0)
      return setErrors({ "care-needs": "Choose at least one kind of help." });
    goNext("care-type");
  }

  function handleCareTypeNext() {
    if (!formData.careType)
      return setErrors({ "care-type": "Choose the type of care you need." });
    goNext("schedule");
  }

  function handleScheduleNext() {
    if (!formData.startDate)
      return setErrors({ startDate: "Please choose an estimated start date." });
    goNext("recipient");
  }

  function handleRecipientNext() {
    const found = {};
    if (!formData.careRecipient) found.careRecipient = "Please choose who needs care.";
    if (!formData.recipientAgeRange) found.recipientAgeRange = "Please choose an age range.";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    goNext("caregiver-prefs");
  }

  async function finalizeAndSubmit(extra) {
    setSubmitting(true);
    setSubmitError(false);

    const phoneDigits = formData.phone.replace(/\D/g, "");

    const result = await submitContactFormWithRetry({
      name: formData.name,
      email: formData.email,
      phone: phoneDigits,
      zip: formData.zip,
      reason: formData.reason,
      town: formData.town || null,
      story: formData.story || null,
      careNeeds: formData.careNeeds.length ? formData.careNeeds : null,
      careType: formData.careType || null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
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
    if (!formData.town.trim())
      return setErrors({ town: "Please enter your company or organization name." });
    finalizeAndSubmit({});
  }

  function handleCaregiverPrefsSubmit(e) {
    e.preventDefault();
    finalizeAndSubmit({});
  }

  const errStyle = (id) => (errors[id] ? { borderColor: "#C2372F" } : undefined);

  function FieldError({ id }) {
    if (!errors[id]) return null;
    return (
      <p className="field-error" role="alert">
        {errors[id]}
      </p>
    );
  }

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
              aria-invalid={!!errors.name}
            />
            <FieldError id="name" />
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
              aria-invalid={!!errors.email}
            />
            <FieldError id="email" />
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
              aria-invalid={!!errors.phone}
            />
            <FieldError id="phone" />
          </div>
          <div>
            <label htmlFor="zip">
              ZIP code{zipRequiresNj(formData.reason) ? " (New Jersey)" : ""}
            </label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={formData.zip}
              onChange={(e) => set("zip", e.target.value)}
              style={errStyle("zip")}
              aria-invalid={!!errors.zip}
            />
            <FieldError id="zip" />
          </div>
        </div>
        <div>
          <label htmlFor="reason">Why are you contacting us?</label>
          <select
            id="reason"
            value={formData.reason}
            onChange={(e) => set("reason", e.target.value)}
            style={errStyle("reason")}
            aria-invalid={!!errors.reason}
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
          <FieldError id="reason" />
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
        <FieldError id="care-needs" />
        <div className="choice-cards" style={errors["care-needs"] ? { outline: "2px solid #C2372F", borderRadius: 14 } : undefined}>
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
        <FieldError id="care-type" />
        <div
          className="pill-group"
          style={{ marginBottom: 24, ...(errors["care-type"] ? { outline: "2px solid #C2372F", borderRadius: 999, padding: 4 } : {}) }}
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
              aria-invalid={!!errors.startDate}
            />
            <FieldError id="startDate" />
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
          <FieldError id="careRecipient" />
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
          <FieldError id="recipientAgeRange" />
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
            <a href="tel:+12012665450">201-266-5450</a>.
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
            aria-invalid={!!errors.town}
          />
          <FieldError id="town" />
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
            <a href="tel:+12012665450">201-266-5450</a>.
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
      case "recipient":
        return renderRecipient();
      case "caregiver-prefs":
        return renderCaregiverPrefs();
      case "partner-details":
        return renderPartnerDetails();
      default:
        return renderIntro();
    }
  }

  return (
    <Reveal id="contact">
      <div className="wrap">
        <div className="contact-grid">
          <div>
            <p className="eyebrow">Home visit</p>
            <h2>
              Tell us about <span className="hl">your loved one</span>
            </h2>
            <p className="lede">
              Send this and a care manager calls you back the same day — we aim for
              within the hour. No obligation, and no one will show up at the door unannounced.
            </p>
            <div className="callout">
              <p style={{ marginBottom: 2 }}>
                <strong>Would rather just talk?</strong>
              </p>
              <a className="big-phone" href="tel:+12012665450">
                201-266-5450
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
