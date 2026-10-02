// Shared by the form component and the server action, so the two can never
// disagree about what a valid submission looks like.

import {
  REASON_OPTIONS,
  CARE_NEEDS_OPTIONS,
  CARE_TYPE_OPTIONS,
  RECIPIENT_OPTIONS,
  GENDER_OPTIONS,
  AGE_RANGE_OPTIONS,
} from "./labels.mjs";

const values = (options) => Object.freeze(options.map((o) => o.value));

export const REASONS = values(REASON_OPTIONS);
export const CARE_NEEDS = values(CARE_NEEDS_OPTIONS);
export const CARE_TYPES = values(CARE_TYPE_OPTIONS);
export const RECIPIENTS = values(RECIPIENT_OPTIONS);
export const GENDERS = values(GENDER_OPTIONS);
export const AGE_RANGES = values(AGE_RANGE_OPTIONS);

export const FIELD_CAPS = Object.freeze({
  name: 120,
  email: 254,
  town: 200,
  story: 5000,
  recipientNotes: 5000,
  caregiverPreferences: 5000,
});

const LOCAL = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?";
const EMAIL = new RegExp(
  `^${LOCAL}(?:\\.${LOCAL})*@${LABEL}(?:\\.${LABEL})*\\.[A-Za-z]{2,63}$`
);

// NANP: neither the area code nor the exchange code may begin with 0 or 1.
const NANP = /^[2-9]\d{2}[2-9]\d{6}$/;

export function normalizePhone(raw) {
  const digits = (raw ?? "").toString().replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function isValidPhone(raw) {
  return NANP.test(normalizePhone(raw));
}

export function isValidEmail(email) {
  const v = (email ?? "").toString();
  return v.length <= FIELD_CAPS.email && EMAIL.test(v);
}

export function isValidZip(zip) {
  return /^[0-9]{5}$/.test((zip ?? "").toString());
}

// Care is only delivered in New Jersey, whose ZIPs run 07001-08989.
export function isNjZip(zip) {
  if (!isValidZip(zip)) return false;
  const n = Number(zip);
  return n >= 7001 && n <= 8989;
}

export function zipRequiresNj(reason) {
  return reason === "general" || reason === "probono";
}

export function zipError(zip, reason) {
  if (!zip) return "Please enter your ZIP code.";
  if (!isValidZip(zip)) return "Enter a 5-digit ZIP code.";
  if (zipRequiresNj(reason) && !isNjZip(zip)) {
    return "We provide care in New Jersey only. Enter an NJ ZIP code, or choose a different reason above.";
  }
  return null;
}

// The business runs in New Jersey, so "today" is today in Newark — not in UTC,
// which would tell a visitor at 9pm ET that tomorrow is in the past.
export function todayInNewJersey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export function isValidDateString(s) {
  const v = (s ?? "").toString();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}
