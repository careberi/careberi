import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizePhone,
  isValidPhone,
  isValidEmail,
  isValidZip,
  isNjZip,
  zipRequiresNj,
  zipError,
  todayInNewJersey,
  isValidDateString,
  FIELD_CAPS,
  AGE_RANGES,
  CARE_NEEDS,
  CARE_TYPES,
  RECIPIENTS,
  GENDERS,
  REASONS,
} from "./validation.mjs";

test("normalizePhone strips a leading 1 from an 11-digit number", () => {
  assert.equal(normalizePhone("+1 201 555 0123"), "2015550123");
  assert.equal(normalizePhone("1-201-555-0123"), "2015550123");
  assert.equal(normalizePhone("(201) 555-0123"), "2015550123");
  assert.equal(normalizePhone("2015550123"), "2015550123");
});

test("normalizePhone leaves an 11-digit number not starting with 1 alone", () => {
  assert.equal(normalizePhone("25015550123"), "25015550123");
});

test("isValidPhone", () => {
  for (const ok of [
    "2015550123",
    "201-555-0123",
    "(201) 555-0123",
    "+1 201 555 0123",
    "1-201-555-0123",
  ])
    assert.equal(isValidPhone(ok), true, ok);
  for (const bad of [
    "20155501",
    "201555012345",
    "abcdefghij",
    "0000000000",
    "1111111111",
    "----------",
    "25015550123",
    "1015550123",
    "",
  ])
    assert.equal(isValidPhone(bad), false, bad);
});

test("isValidEmail", () => {
  for (const ok of [
    "a@b.co",
    "test@example.com",
    "first.last@sub.example.org",
    "x+tag@example.co.uk",
  ])
    assert.equal(isValidEmail(ok), true, ok);
  for (const bad of [
    "plainword",
    "a@b",
    "a@b.c",
    "@example.com",
    "a b@example.com",
    "a@@example.com",
    "a@example..com",
    "a@-.com",
    "a@[127.0.0.1]",
    "test@example.com.",
    "a@b.c<script>",
    ".a@example.com",
    "a.@example.com",
    "a@example.com-",
    "x".repeat(250) + "@example.com",
    "",
  ])
    assert.equal(isValidEmail(bad), false, bad);
});

test("isValidZip requires exactly five digits", () => {
  assert.equal(isValidZip("07030"), true);
  for (const bad of ["0703", "070301", "abcde", " 0703", ""])
    assert.equal(isValidZip(bad), false, bad);
});

test("isNjZip covers 07001-08989 only", () => {
  assert.equal(isNjZip("07001"), true);
  assert.equal(isNjZip("08989"), true);
  assert.equal(isNjZip("07000"), false);
  assert.equal(isNjZip("08990"), false);
  assert.equal(isNjZip("90210"), false);
});

test("zipRequiresNj is true for care reasons only", () => {
  assert.equal(zipRequiresNj("general"), true);
  assert.equal(zipRequiresNj("probono"), true);
  assert.equal(zipRequiresNj("partner"), false);
});

test("zipError gates New Jersey by reason", () => {
  assert.equal(zipError("07030", "general"), null);
  assert.equal(zipError("07001", "general"), null);
  assert.equal(zipError("08989", "general"), null);
  assert.match(zipError("07000", "general"), /New Jersey/);
  assert.match(zipError("08990", "general"), /New Jersey/);
  assert.match(zipError("90210", "probono"), /New Jersey/);
  assert.equal(zipError("90210", "partner"), null);
  assert.match(zipError("0703", "partner"), /5-digit/);
  assert.match(zipError("abcde", "partner"), /5-digit/);
  assert.match(zipError("", "general"), /enter your ZIP/i);
});

test("todayInNewJersey returns an ET calendar date, not a UTC one", () => {
  const d = todayInNewJersey();
  assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  const et = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
  assert.equal(d, et);
});

test("isValidDateString rejects impossible calendar dates", () => {
  assert.equal(isValidDateString("2026-11-01"), true);
  assert.equal(isValidDateString("2024-02-29"), true);
  for (const bad of ["2026-02-30", "2026-13-01", "11-01-2026", "2026-1-1", ""])
    assert.equal(isValidDateString(bad), false, bad);
});

test("allow-lists and caps carry the spec's exact values", () => {
  assert.deepEqual(REASONS, ["general", "probono", "partner"]);
  assert.deepEqual(CARE_TYPES, ["recurring", "one_time", "live_in"]);
  assert.deepEqual(GENDERS, ["female", "male"]);
  assert.deepEqual(RECIPIENTS, [
    "parent",
    "spouse",
    "adult_child",
    "friend_relative",
    "myself",
  ]);
  assert.deepEqual(CARE_NEEDS, [
    "household_tasks",
    "personal_care",
    "companionship",
    "transportation",
    "specialized_care",
    "mobility_assistance",
  ]);
  assert.deepEqual(AGE_RANGES, [
    "20s",
    "30s",
    "40s",
    "50s",
    "60s",
    "70s",
    "80s",
    "90s_plus",
  ]);
  assert.equal(FIELD_CAPS.name, 120);
  assert.equal(FIELD_CAPS.email, 254);
  assert.equal(FIELD_CAPS.town, 200);
  assert.equal(FIELD_CAPS.story, 5000);
  assert.equal(FIELD_CAPS.recipientNotes, 5000);
  assert.equal(FIELD_CAPS.caregiverPreferences, 5000);
});
