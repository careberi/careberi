"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { LEAD_FROM_EMAIL, LEAD_TO_EMAIL } from "../lib/site";
import { renderLeadEmail } from "../lib/leadEmail.mjs";
import { checkRateLimit } from "../lib/rateLimit.mjs";
import {
  AGE_RANGES,
  CARE_NEEDS,
  CARE_TYPES,
  FIELD_CAPS,
  GENDERS,
  REASONS,
  RECIPIENTS,
  isValidDateString,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  todayInNewJersey,
  zipError,
} from "../lib/validation.mjs";

// Caregiver applications are handled by CareSmartz360, not this form.

const VALIDATION = { success: false, error: "validation" };
const SERVER = { success: false, error: "server" };

function cleanText(value, cap) {
  const v = value?.toString().trim();
  if (!v) return null;
  return v.length > cap ? false : v;
}

function pickOne(value, allowed) {
  return allowed.includes(value) ? value : null;
}

async function clientIp() {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for") || "";
    return fwd.split(",")[0].trim() || h.get("x-real-ip") || "";
  } catch {
    return "";
  }
}

export async function submitContactForm(payload) {
  // A filled honeypot gets `success` on purpose: an error teaches a bot to retry.
  if (payload?.company_website?.toString().trim()) {
    return { success: true, reason: payload.reason };
  }

  if (!checkRateLimit(await clientIp())) return SERVER;

  const name = payload.name?.toString().trim();
  const email = payload.email?.toString().trim();
  const phone = normalizePhone(payload.phone);
  const zip = payload.zip?.toString().trim();
  const reason = payload.reason?.toString().trim();

  if (
    !name ||
    name.length > FIELD_CAPS.name ||
    !email ||
    !isValidEmail(email) ||
    !isValidPhone(phone) ||
    !zip ||
    !reason ||
    !REASONS.includes(reason) ||
    zipError(zip, reason) !== null
  ) {
    return VALIDATION;
  }

  const town = cleanText(payload.town, FIELD_CAPS.town);
  const story = cleanText(payload.story, FIELD_CAPS.story);
  const recipientNotes = cleanText(payload.recipientNotes, FIELD_CAPS.recipientNotes);
  const caregiverPreferences = cleanText(
    payload.caregiverPreferences,
    FIELD_CAPS.caregiverPreferences
  );
  if (
    town === false ||
    story === false ||
    recipientNotes === false ||
    caregiverPreferences === false
  ) {
    return VALIDATION;
  }

  if (reason === "partner" && !town) return VALIDATION;

  const startDate = payload.startDate || null;
  const endDate = payload.endDate || null;
  if (startDate !== null) {
    if (!isValidDateString(startDate) || startDate < todayInNewJersey()) return VALIDATION;
  }
  if (endDate !== null) {
    if (!isValidDateString(endDate)) return VALIDATION;
    if (startDate !== null && endDate < startDate) return VALIDATION;
  }

  const timeStart = Number(payload.timeStart);
  const timeEnd = Number(payload.timeEnd);
  const hasTimes = payload.timeStart != null && payload.timeEnd != null;
  if (hasTimes) {
    const whole = (n) => Number.isInteger(n) && n >= 0 && n <= 24;
    if (!whole(timeStart) || !whole(timeEnd) || timeStart >= timeEnd) return VALIDATION;
  }

  const careNeeds = Array.isArray(payload.careNeeds)
    ? payload.careNeeds.filter((v) => CARE_NEEDS.includes(v))
    : [];

  const lead = {
    name,
    email,
    phone,
    zip,
    reason,
    town,
    story,
    careNeeds,
    careType: pickOne(payload.careType, CARE_TYPES),
    startDate,
    endDate,
    timeStart: hasTimes ? timeStart : null,
    timeEnd: hasTimes ? timeEnd : null,
    careRecipient: pickOne(payload.careRecipient, RECIPIENTS),
    recipientGender: pickOne(payload.recipientGender, GENDERS),
    recipientAgeRange: pickOne(payload.recipientAgeRange, AGE_RANGES),
    recipientNotes,
    caregiverPreferences,
  };

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("submitContactForm: RESEND_API_KEY is not set");
      return SERVER;
    }

    const { subject, html } = renderLeadEmail(lead);
    const { error } = await new Resend(apiKey).emails.send({
      from: LEAD_FROM_EMAIL,
      to: LEAD_TO_EMAIL,
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("lead email send failed:", error);
      return SERVER;
    }

    return { success: true, reason };
  } catch (err) {
    console.error("submitContactForm threw:", err);
    return SERVER;
  }
}
