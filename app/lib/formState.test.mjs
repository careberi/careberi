import { test } from "node:test";
import assert from "node:assert/strict";
import { resetBranchFields } from "./formState.mjs";

test("switching care -> partner clears care answers", () => {
  const next = resetBranchFields(
    {
      name: "Jane",
      reason: "general",
      careNeeds: ["personal_care"],
      careType: "recurring",
      startDate: "2026-11-01",
      careRecipient: "parent",
      recipientNotes: "notes",
      town: "",
    },
    "partner"
  );
  assert.equal(next.name, "Jane", "shared fields survive");
  assert.deepEqual(next.careNeeds, []);
  assert.equal(next.careType, "");
  assert.equal(next.startDate, "");
  assert.equal(next.careRecipient, "");
  assert.equal(next.recipientNotes, "");
});

test("switching partner -> care clears partner answers", () => {
  const next = resetBranchFields({ reason: "partner", town: "Acme", story: "hi" }, "general");
  assert.equal(next.town, "");
  assert.equal(next.story, "");
});

test("care -> partner -> care leaves no partner residue", () => {
  const a = resetBranchFields({ reason: "general", careNeeds: ["personal_care"] }, "partner");
  const b = resetBranchFields({ ...a, reason: "partner", town: "Acme" }, "general");
  assert.equal(b.town, "");
  assert.deepEqual(b.careNeeds, []);
});

test("general -> probono keeps care answers (same branch)", () => {
  const next = resetBranchFields(
    { reason: "general", careNeeds: ["personal_care"] },
    "probono"
  );
  assert.deepEqual(next.careNeeds, ["personal_care"]);
});

test("choosing a reason from empty keeps whatever was typed", () => {
  const next = resetBranchFields({ reason: "", name: "Jane", careNeeds: [] }, "general");
  assert.equal(next.name, "Jane");
});

test("the reason itself is set on the returned object", () => {
  assert.equal(resetBranchFields({ reason: "general" }, "partner").reason, "partner");
  assert.equal(resetBranchFields({ reason: "general" }, "probono").reason, "probono");
});

test("the input object is not mutated", () => {
  const input = { reason: "general", careNeeds: ["personal_care"], town: "" };
  resetBranchFields(input, "partner");
  assert.deepEqual(input.careNeeds, ["personal_care"]);
  assert.equal(input.reason, "general");
});
