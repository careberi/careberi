// Turns a validated submission into the email Neil reads. Pure: no I/O, no env.
// Email clients strip <style> blocks, so every rule here is inline.

import {
  CARE_NEEDS_OPTIONS,
  CARE_TYPE_OPTIONS,
  RECIPIENT_OPTIONS,
  GENDER_OPTIONS,
  AGE_RANGE_OPTIONS,
  REASON_OPTIONS,
  labelFor,
  formatHour,
} from "./labels.mjs";

const SUBJECT_PREFIX = {
  general: "Care request",
  probono: "Pro bono request",
  partner: "Partnership",
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const present = (v) =>
  v !== null && v !== undefined && String(v).trim() !== "";

const LABEL_CELL =
  'style="padding:8px 14px 8px 0;vertical-align:top;color:#4A5568;' +
  'font:600 13px/1.5 system-ui,sans-serif;white-space:nowrap"';
const VALUE_CELL =
  'style="padding:8px 0;vertical-align:top;color:#16265C;' +
  'font:400 15px/1.5 system-ui,sans-serif;word-break:break-word"';

function row(label, value) {
  if (!present(value)) return "";
  return (
    `<tr><td ${LABEL_CELL}>${esc(label)}</td>` +
    `<td ${VALUE_CELL}>${esc(value)}</td></tr>`
  );
}

export function renderLeadEmail(payload) {
  const p = payload ?? {};
  const isPartner = p.reason === "partner";

  // Raw: this is an RFC-822 header, not markup. It is escaped once below, where
  // it is interpolated into the HTML heading.
  const rawSubject = isPartner
    ? `${SUBJECT_PREFIX.partner} — ${p.town ?? ""}`
    : `${SUBJECT_PREFIX[p.reason] ?? "Enquiry"} — ${p.name ?? ""} (${p.zip ?? ""})`;
  // Collapse CR/LF: a header carrying a newline is how mail-header injection works.
  const subject = rawSubject.replace(new RegExp("[\\r\\n]+", "g"), " ").trim();

  const careNeeds = Array.isArray(p.careNeeds)
    ? p.careNeeds.map((v) => labelFor(CARE_NEEDS_OPTIONS, v)).filter(Boolean)
    : [];

  const hours =
    present(p.timeStart) && present(p.timeEnd)
      ? `${formatHour(p.timeStart)}–${formatHour(p.timeEnd)}`
      : null;

  const rows = [
    row("Reason", labelFor(REASON_OPTIONS, p.reason)),
    row("Name", p.name),
    row("Email", p.email),
    row("Phone", p.phone),
    row("ZIP", p.zip),
    row("Organization", isPartner ? p.town : null),
  ];

  if (!isPartner) {
    rows.push(
      row("Care needs", careNeeds.length ? careNeeds.join(", ") : null),
      row("Care type", labelFor(CARE_TYPE_OPTIONS, p.careType)),
      row("Start date", p.startDate),
      row("End date", p.endDate),
      row("Hours", hours),
      row("Who needs care", labelFor(RECIPIENT_OPTIONS, p.careRecipient)),
      row("Gender", labelFor(GENDER_OPTIONS, p.recipientGender)),
      row("Age", labelFor(AGE_RANGE_OPTIONS, p.recipientAgeRange)),
      row("What to know", p.recipientNotes),
      row("Caregiver preferences", p.caregiverPreferences)
    );
  }

  rows.push(row("Message", p.story));

  const html =
    `<div style="background:#F7F9FC;padding:24px;font:400 15px/1.5 system-ui,sans-serif">` +
    `<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:28px">` +
    `<p style="margin:0 0 18px;font:600 18px/1.3 system-ui,sans-serif;color:#16265C">` +
    `${esc(subject)}</p>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" ` +
    `style="width:100%;border-collapse:collapse;table-layout:fixed">` +
    rows.join("") +
    `</table>` +
    `<p style="margin:20px 0 0;color:#4A5568;font-size:13px">` +
    `Sent from the careberi.com contact form. Reply to reach them directly.</p>` +
    `</div></div>`;

  return { subject, html };
}
