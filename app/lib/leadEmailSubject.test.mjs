import { test } from "node:test";
import assert from "node:assert/strict";
import { renderLeadEmail } from "./leadEmail.mjs";

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

const base = {
  reason: "general",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "2015550123",
  zip: "07030",
};

test("the subject carries no CR/LF, so mail headers cannot be injected", () => {
  const { subject } = renderLeadEmail({
    ...base,
    name: "Jane" + CR + LF + "Bcc: attacker@example.com",
  });
  assert.ok(subject.indexOf(CR) === -1, "no carriage return");
  assert.ok(subject.indexOf(LF) === -1, "no line feed");
  assert.ok(
    subject.includes("Bcc: attacker@example.com"),
    "the text survives as literal subject text"
  );
});

test("a lone line feed is collapsed too", () => {
  const { subject } = renderLeadEmail({ ...base, name: "Jane" + LF + "Smith" });
  assert.ok(subject.indexOf(LF) === -1);
  assert.equal(subject, "Care request — Jane Smith (07030)");
});
