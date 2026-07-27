"use server";

import { createClient } from "../../lib/supabase/server";

const REASONS = new Set(["general", "probono", "partner", "employment"]);

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

export async function submitContactForm(payload) {
  const name = payload.name?.toString().trim();
  const email = payload.email?.toString().trim();
  const phone = payload.phone?.toString().replace(/\D/g, "");
  const town = payload.town?.toString().trim();
  const zip = payload.zip?.toString().trim();
  const reason = payload.reason?.toString().trim();
  const story = payload.story?.toString().trim() || null;
  const bestTime = payload.bestTime?.toString().trim() || null;
  const resumePath = payload.resumePath?.toString().trim() || null;

  if (
    !name ||
    !town ||
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

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone,
      town,
      zip,
      reason,
      story,
      best_time: bestTime,
      resume_path: resumePath,
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
