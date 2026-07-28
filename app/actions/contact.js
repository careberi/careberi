"use server";

import { createClient } from "../../lib/supabase/server";

const REASONS = new Set(["general", "probono", "partner", "employment"]);
const CARE_TYPES = new Set(["recurring", "one_time", "live_in"]);
const RECIPIENTS = new Set(["parent", "spouse", "adult_child", "friend_relative", "myself"]);
const GENDERS = new Set(["female", "male"]);
const CARE_NEEDS = new Set([
  "household_tasks",
  "personal_care",
  "companionship",
  "transportation",
  "specialized_care",
  "mobility_assistance",
]);

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

function isValidNjZip(zip) {
  if (!/^[0-9]{5}$/.test(zip)) return false;
  const n = Number(zip);
  return n >= 7001 && n <= 8989;
}

function cleanText(value) {
  const v = value?.toString().trim();
  return v || null;
}

export async function submitContactForm(payload) {
  const name = payload.name?.toString().trim();
  const email = payload.email?.toString().trim();
  const phone = payload.phone?.toString().replace(/\D/g, "");
  const zip = payload.zip?.toString().trim();
  const reason = payload.reason?.toString().trim();

  if (
    !name ||
    !email ||
    !isValidEmail(email) ||
    !phone ||
    !isValidPhone(phone) ||
    !zip ||
    !isValidNjZip(zip) ||
    !reason ||
    !REASONS.has(reason)
  ) {
    return { success: false, error: "validation" };
  }

  if (reason === "partner" && !cleanText(payload.town)) {
    return { success: false, error: "validation" };
  }

  const careNeeds = Array.isArray(payload.careNeeds)
    ? payload.careNeeds.filter((v) => CARE_NEEDS.has(v))
    : null;
  const careType = CARE_TYPES.has(payload.careType) ? payload.careType : null;
  const careRecipient = RECIPIENTS.has(payload.careRecipient) ? payload.careRecipient : null;
  const recipientGender = GENDERS.has(payload.recipientGender) ? payload.recipientGender : null;

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone,
      zip,
      reason,
      town: cleanText(payload.town),
      story: cleanText(payload.story),
      resume_path: cleanText(payload.resumePath),
      care_needs: careNeeds && careNeeds.length ? careNeeds : null,
      care_type: careType,
      start_date: payload.startDate || null,
      end_date: payload.endDate || null,
      time_start: payload.timeStart != null ? String(payload.timeStart) : null,
      time_end: payload.timeEnd != null ? String(payload.timeEnd) : null,
      pay_min: payload.payMin ?? null,
      pay_max: payload.payMax ?? null,
      care_recipient: careRecipient,
      recipient_gender: recipientGender,
      recipient_age_range: cleanText(payload.recipientAgeRange),
      recipient_notes: cleanText(payload.recipientNotes),
      caregiver_preferences: cleanText(payload.caregiverPreferences),
    });

    if (error) {
      console.error("contact_submissions insert failed:", error);
      return { success: false, error: "server" };
    }

    return { success: true, reason };
  } catch (err) {
    console.error("contact_submissions action threw:", err);
    return { success: false, error: "server" };
  }
}
