"use server";

import { createClient } from "../../lib/supabase/server";

export async function submitContactForm(formData) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("contact_submissions").insert({
      name: formData.get("name")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      town: formData.get("town")?.toString().trim(),
      story: formData.get("story")?.toString().trim() || null,
      best_time: formData.get("best")?.toString().trim() || null,
    });

    if (error) {
      console.error("contact_submissions insert failed:", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("contact_submissions action threw:", err);
    return { success: false };
  }
}
