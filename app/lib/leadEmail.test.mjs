import { test } from "node:test";
import assert from "node:assert/strict";
import { renderLeadEmail } from "./leadEmail.mjs";

const base = {
  reason: "general",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "2015550123",
  zip: "07030",
};

test("subject carries reason, name and ZIP", () => {
  assert.equal(
    renderLeadEmail({ reason: "general", name: "Jane Doe", zip: "07030" }).subject,
    "Care request — Jane Doe (07030)"
  );
  assert.equal(
    renderLeadEmail({ reason: "probono", name: "Jane Doe", zip: "07030" }).subject,
    "Pro bono request — Jane Doe (07030)"
  );
  assert.equal(
    renderLeadEmail({ reason: "partner", name: "Jane", town: "Acme Health" }).subject,
    "Partnership — Acme Health"
  );
});

test("a partner payload emits no care rows", () => {
  const { html } = renderLeadEmail({
    ...base,
    reason: "partner",
    town: "Acme Health",
    story: "Hello",
  });
  for (const absent of [
    "Care needs",
    "Care type",
    "Start date",
    "Hours",
    "Who needs care",
    "Caregiver preferences",
  ])
    assert.ok(!html.includes(absent), absent);
  assert.ok(html.includes("Acme Health"));
});

test("absent and empty fields emit no row", () => {
  const { html } = renderLeadEmail({
    ...base,
    recipientNotes: "",
    caregiverPreferences: null,
  });
  assert.ok(!html.includes("What to know"));
  assert.ok(!html.includes("Caregiver preferences"));
});

test("free text is HTML-escaped", () => {
  const { html } = renderLeadEmail({
    ...base,
    name: "<script>alert(1)</script>",
    recipientNotes: 'Tom & "Jerry" <b>bold</b>',
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&amp;"));
  assert.ok(html.includes("&quot;") || html.includes("&#34;"));
  assert.ok(!html.includes("<b>bold</b>"));
});

test("the subject is escaped too", () => {
  const { subject } = renderLeadEmail({
    ...base,
    name: "<script>alert(1)</script>",
  });
  assert.ok(!subject.includes("<script>"));
});

test("an unbroken long word cannot widen the table", () => {
  const { html } = renderLeadEmail({
    ...base,
    recipientNotes: "A".repeat(400),
  });
  assert.match(html, /word-break:\s*break-word/);
});

test("care rows render in the documented order", () => {
  const { html } = renderLeadEmail({
    ...base,
    careNeeds: ["personal_care", "companionship"],
    careType: "recurring",
    startDate: "2026-11-01",
    endDate: "2026-12-01",
    timeStart: 9,
    timeEnd: 17,
    careRecipient: "parent",
    recipientGender: "female",
    recipientAgeRange: "80s",
  });
  const order = [
    "Reason",
    "Name",
    "Email",
    "Phone",
    "ZIP",
    "Care needs",
    "Care type",
    "Start date",
    "End date",
    "Hours",
    "Who needs care",
    "Gender",
    "Age",
  ];
  const idx = order.map((l) => html.indexOf(l));
  assert.ok(
    idx.every((i) => i > -1),
    "every label present: " + JSON.stringify(order.filter((_, i) => idx[i] === -1))
  );
  assert.deepEqual(idx, [...idx].sort((a, b) => a - b));
});

test("enum values render as human labels, not raw keys", () => {
  const { html } = renderLeadEmail({
    ...base,
    careNeeds: ["personal_care", "mobility_assistance"],
    careType: "one_time",
    careRecipient: "adult_child",
    recipientAgeRange: "90s_plus",
  });
  assert.ok(html.includes("Personal care"));
  assert.ok(html.includes("Mobility assistance"));
  assert.ok(html.includes("One-time"));
  assert.ok(html.includes("My adult child"));
  // The apostrophe in "90's+" is correctly escaped; it renders as 90's+.
  assert.ok(html.includes("90&#39;s+"));
  assert.ok(!html.includes("personal_care"));
  assert.ok(!html.includes("90s_plus"));
});

test("a full-day range reads as midnight, not 12:00 AM twice", () => {
  const { html } = renderLeadEmail({ ...base, timeStart: 0, timeEnd: 24 });
  assert.ok(html.includes("12:00 AM"));
  assert.ok(html.includes("midnight"));
});
